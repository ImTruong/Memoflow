import { AiChatMessage } from '../types/aiChat';

const FREE_LLM_API_KEY = process.env.EXPO_PUBLIC_FREE_LLM_API_KEY || 'apf_h4p00jki78k1ef8qokub5ite';
const FREE_LLM_URL = process.env.EXPO_PUBLIC_FREE_LLM_URL || 'https://apifreellm.com/api/v1/chat';
const FREE_LLM_MODEL = process.env.EXPO_PUBLIC_FREE_LLM_MODEL || 'apifreellm';
const FREE_LLM_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_FREE_LLM_TIMEOUT_MS || 40000);

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

const buildPromptForProvider = (userPrompt: string, history: AiChatMessage[]): string => {
  const compactHistory = history
    .slice(-6)
    .map((msg) => `${msg.role === 'assistant' ? 'Tutor' : 'User'}: ${msg.content}`)
    .join('\n');

  return [
    SYSTEM_PROMPT,
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

const callFreeLlm = async (userPrompt: string, history: AiChatMessage[]): Promise<ProviderCallResult> => {
  if (!FREE_LLM_API_KEY) {
    debugLog('FreeLLM skipped: missing API key');
    return { text: null, reason: 'missing_api_key' };
  }

  try {
    const response = await withTimeout(
      fetch(FREE_LLM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${FREE_LLM_API_KEY}`,
        },
        body: JSON.stringify({
          message: buildPromptForProvider(userPrompt, history),
          model: FREE_LLM_MODEL,
        }),
      }),
      FREE_LLM_TIMEOUT_MS,
      'free_llm_timeout',
    );

    if (!response.ok) {
      const body = await response.text();
      debugLog('FreeLLM http error', { status: response.status, body: body.slice(0, 300) });
      return { text: null, reason: `http_${response.status}` };
    }

    const data = (await response.json()) as FreeLlmResponse;
    debugLog('FreeLLM response meta', {
      success: data?.success ?? null,
      tier: data?.tier ?? null,
      delaySeconds: data?.features?.delaySeconds ?? null,
    });

    if (data?.success === false) {
      return { text: null, reason: 'api_unsuccess' };
    }

    const text = typeof data?.response === 'string' ? data.response.trim() : '';
    if (text) {
      return { text, reason: 'ok' };
    }

    return { text: null, reason: 'empty_response' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const lowered = message.toLowerCase();

    if (lowered.includes('free_llm_timeout')) {
      debugLog('FreeLLM timeout', { timeoutMs: FREE_LLM_TIMEOUT_MS });
      return { text: null, reason: 'timeout' };
    }

    debugLog('FreeLLM runtime error', { message });
    return { text: null, reason: 'network_or_runtime_error' };
  }
};

export const aiProviderApi = {
  generateTutorReply: async (userPrompt: string, history: AiChatMessage[]): Promise<string> => {
    if (!isEnglishLearningPrompt(userPrompt)) {
      return OUT_OF_SCOPE_REPLY;
    }

    if (!FREE_LLM_API_KEY) {
      console.warn('No FreeLLM API key configured on frontend.');
      return MISSING_KEY_REPLY;
    }

    try {
      const providerResult = await callFreeLlm(userPrompt, history);
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
