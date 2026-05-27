import { apiFetch } from './apiClient';
import { ApiResponse, PageResponse } from '../types/flashcard';
import { WordHuntProgress } from '../types/wordHunt';

const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';

// Cache nghia tieng Viet de tranh goi lai MyMemory cho cung mot tu.
const meaningCache = new Map<string, string | null>();
const inFlightMeaningRequests = new Map<string, Promise<string | null>>();
const ENGLISH_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'with',
  'which',
  'often',
  'usually',
  'contains',
]);

const normalizeWord = (word: string): string => word.trim().toLowerCase();

const tokenizeAsciiWords = (value: string): string[] => {
  const tokens = value.toLowerCase().match(/[a-z]+/g);
  return tokens ?? [];
};

const isLikelyEnglishDefinition = (value: string): boolean => {
  const tokens = tokenizeAsciiWords(value);
  if (tokens.length < 6) {
    return false;
  }

  let stopWordCount = 0;
  for (const token of tokens) {
    if (ENGLISH_STOP_WORDS.has(token)) {
      stopWordCount += 1;
    }
  }

  return /[.!?]/.test(value) || stopWordCount >= 3;
};

const isValidMeaningCandidate = (candidate: string, sourceWord: string): boolean => {
  const cleaned = candidate.trim();
  if (!cleaned) {
    return false;
  }

  if (cleaned.toLowerCase() === sourceWord) {
    return false;
  }

  if (isLikelyEnglishDefinition(cleaned)) {
    return false;
  }

  return true;
};

const getTranslationCandidates = (payload: any): string[] => {
  const candidates: string[] = [];

  const primary = payload?.responseData?.translatedText;
  if (typeof primary === 'string') {
    candidates.push(primary);
  }

  const matches = Array.isArray(payload?.matches) ? payload.matches : [];
  for (const item of matches) {
    const translated = item?.translation;
    if (typeof translated === 'string') {
      candidates.push(translated);
    }
  }

  return candidates;
};

const pickBestMeaningCandidate = (candidates: string[], sourceWord: string): string | null => {
  const seen = new Set<string>();

  for (const raw of candidates) {
    const cleaned = raw.trim();
    const normalized = cleaned.toLowerCase();

    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);

    if (isValidMeaningCandidate(cleaned, sourceWord)) {
      return cleaned;
    }
  }

  return null;
};

export type UpdateWordHuntProgressRequest = {
  isCompleted: boolean;
  progressPercent: number;
  score: number;
  hintsUsedToday: number;
  hintsUsedDate: string;
};

export const wordHuntApi = {
  // API noi bo: lay danh sach man Word Hunt kem tien do cua user.
  getWordHuntLessons: (page: number = 0, size: number = 20) =>
    apiFetch<ApiResponse<PageResponse<WordHuntProgress>>>(
      `/word-hunt-lessons?page=${page}&size=${size}&sort=id,asc`
    ),

  // API noi bo: lay chi tiet mot man Word Hunt.
  getWordHuntLessonDetail: (lessonId: number) =>
    apiFetch<ApiResponse<WordHuntProgress>>(`/word-hunt-lessons/${lessonId}`),

  // API noi bo: gui tien do Word Hunt sau khi user choi.
  updateWordHuntProgress: (lessonId: number, payload: UpdateWordHuntProgressRequest) =>
    apiFetch<ApiResponse<WordHuntProgress>>(`/word-hunt-lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const getCachedVietnameseMeaning = (word: string): string | null => {
  const normalizedWord = normalizeWord(word);
  if (normalizedWord.length < 2) {
    return null;
  }

  return meaningCache.get(normalizedWord) ?? null;
};

export const prefetchVietnameseMeanings = (words: string[]): void => {
  const uniqueWords = Array.from(
    new Set(words.map(normalizeWord).filter((word) => word.length >= 2))
  );

  if (uniqueWords.length === 0) {
    return;
  }

  void Promise.allSettled(uniqueWords.map((word) => fetchVietnameseMeaning(word)));
};

// API ngoai: goi MyMemory Translate de dich tu tieng Anh sang tieng Viet.
export async function fetchVietnameseMeaning(word: string): Promise<string | null> {
  const normalizedWord = normalizeWord(word);
  if (normalizedWord.length < 2) {
    return null;
  }

  if (meaningCache.has(normalizedWord)) {
    return meaningCache.get(normalizedWord) ?? null;
  }

  const inFlightRequest = inFlightMeaningRequests.get(normalizedWord);
  if (inFlightRequest) {
    return inFlightRequest;
  }

  const request = (async (): Promise<string | null> => {
    try {
      const response = await fetch(
        `${TRANSLATE_ENDPOINT}?q=${encodeURIComponent(normalizedWord)}&langpair=en|vi`
      );

      if (!response.ok) {
        return null;
      }

      const payload = await response.json();
      const candidates = getTranslationCandidates(payload);
      return pickBestMeaningCandidate(candidates, normalizedWord);
    } catch {
      return null;
    }
  })();

  inFlightMeaningRequests.set(normalizedWord, request);

  try {
    const meaning = await request;
    meaningCache.set(normalizedWord, meaning);
    return meaning;
  } finally {
    inFlightMeaningRequests.delete(normalizedWord);
  }
}
