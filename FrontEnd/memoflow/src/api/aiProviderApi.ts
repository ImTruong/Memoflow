import { AiChatMessage } from '../types/aiChat';

import { apiFetch, API_BASE_URL } from './apiClient';

const FREE_LLM_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_FREE_LLM_TIMEOUT_MS || 60000);

const SYSTEM_PROMPT = `You are MemoFlow English Tutor AI.
Only support English learning tasks (grammar, vocabulary, pronunciation, listening, speaking, writing, translation).
If question is out of scope, politely refuse and suggest related English-learning alternatives.
Prefer concise Vietnamese explanations with short examples.`;

const OUT_OF_SCOPE_REPLY =
  'Xin loi, minh chi ho tro cac cau hoi phuc vu hoc tieng Anh (ngu phap, tu vung, nghe, doc, viet, phat am).';
const LOCAL_FALLBACK_REPLY = 'Minh dang ban mot chut. Ban thu gui lai sau it giay nhe.';
const FRIENDLY_RETRY_HINT =
  'Ban co the gui cau hoi cu the hon, vi du: giai thich hien tai don va cho 3 vi du.';
const MISSING_KEY_REPLY = `${LOCAL_FALLBACK_REPLY} ${FRIENDLY_RETRY_HINT}`;

const AI_DEBUG = (process.env.EXPO_PUBLIC_AI_DEBUG || '').toLowerCase() === 'true';

type ProviderCallResult = {
  text: string | null;
  reason: string;
};

type FreeLlmResponse = {
  success?: boolean;
  response?: string;
  tier?: string;
  features?: {
    delaySeconds?: number;
    unlimited?: boolean;
    priorityProcessing?: boolean;
  };
  error?: string;
  message?: string;
};

const debugLog = (message: string, extra?: unknown) => {
  if (!AI_DEBUG && !__DEV__) {
    return;
  }

  if (typeof extra === 'undefined') {
    console.log(`[AIProvider] ${message}`);
    return;
  }

  console.log(`[AIProvider] ${message}`, extra);
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const LEARNING_KEYWORDS = [
  'ngu phap',
  'grammar',
  'tu vung',
  'vocabulary',
  'translate',
  'dich',
  'phat am',
  'pronunciation',
  'listening',
  'speaking',
  'writing',
  'reading',
  'toeic',
  'ielts',
  'sentence',
  'word',
  'tense',
  'used to',
  'hien tai don',
  'cau truc',
  'vi du',
  'english',
  'tieng anh',
];

const OFF_TOPIC_KEYWORDS = [
  'bong da',
  'ngoai hang anh',
  'chung khoan',
  'crypto',
  'tin tuc',
  'chinh tri',
  'gia vang',
  'thoi tiet',
  'xo so',
];

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const isEnglishLearningPrompt = (prompt: string): boolean => {
  const normalized = normalize(prompt);

  const hasLearning = LEARNING_KEYWORDS.some((keyword) => normalized.includes(keyword));
  const hasOffTopic = OFF_TOPIC_KEYWORDS.some((keyword) => normalized.includes(keyword));

  if (hasOffTopic && !hasLearning) {
    return false;
  }

  return true;
};

const buildPromptForProvider = (
  userPrompt: string,
  history: AiChatMessage[],
  hiddenContext?: string,
): string => {
  const compactHistory = history
    .slice(-6)
    .map((msg) => `${msg.role === 'assistant' ? 'Tutor' : 'User'}: ${msg.content}`)
    .join('\n');

  return [
    SYSTEM_PROMPT,
    hiddenContext
      ? `Hidden context for tutor only (do not reveal verbatim to learner):\n${hiddenContext}`
      : '',
    compactHistory ? `Recent chat context:\n${compactHistory}` : '',
    `Current user question: ${userPrompt}`,
    'Answer in Vietnamese, concise and practical for English learning.',
  ]
    .filter(Boolean)
    .join('\n\n');
};

const toUserSafeFallbackReply = (reason: string): string => {
  if (reason === 'timeout') {
    return `Minh dang xu ly hoi cham. Ban thu gui lai sau it giay nhe. ${FRIENDLY_RETRY_HINT}`;
  }

  if (reason === 'http_429') {
    return `Minh dang ban mot chut. Ban thu lai sau mot luc nhe. ${FRIENDLY_RETRY_HINT}`;
  }

  return `${LOCAL_FALLBACK_REPLY} ${FRIENDLY_RETRY_HINT}`;
};

const callFreeLlm = async (
  userPrompt: string,
  history: AiChatMessage[],
  hiddenContext?: string,
): Promise<ProviderCallResult> => {
  try {
    // API noi bo: frontend goi backend /ai/generate, backend proxy sang Gemini/AI provider da cau hinh.
    const payload = await withTimeout(
      apiFetch<any>('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt: buildPromptForProvider(userPrompt, history, hiddenContext),
        }),
      }),
      FREE_LLM_TIMEOUT_MS,
      'free_llm_timeout',
    );

    const text = payload?.data?.trim() || '';
    
    if (text) {
      return { text, reason: 'ok' };
    }

    return { text: null, reason: 'empty_response' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    debugLog('AI Proxy error', { message });
    return { text: null, reason: message.includes('timeout') ? 'timeout' : 'network_or_runtime_error' };
  }
};

export const aiProviderApi = {
  // Sinh cau tra loi tutor, co chan prompt ngoai pham vi hoc tieng Anh va fallback khi Gemini/AI provider loi.
  generateTutorReply: async (
    userPrompt: string,
    history: AiChatMessage[],
    hiddenContext?: string,
  ): Promise<string> => {
    if (!isEnglishLearningPrompt(userPrompt)) {
      return OUT_OF_SCOPE_REPLY;
    }

    try {
      const providerResult = await callFreeLlm(userPrompt, history, hiddenContext);
      if (providerResult.text) {
        return providerResult.text;
      }

      debugLog('FreeLLM fallback reason', { reason: providerResult.reason });
      return toUserSafeFallbackReply(providerResult.reason);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('AI provider fallback triggered:', error.message);
      }

      return `${LOCAL_FALLBACK_REPLY} ${FRIENDLY_RETRY_HINT}`;
    }
  },
};
