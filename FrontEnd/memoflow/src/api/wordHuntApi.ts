import { apiFetch } from './apiClient';
import { ApiResponse, PageResponse } from '../types/flashcard';
import { WordHuntProgress } from '../types/wordHunt';

const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';

const meaningCache = new Map<string, string | null>();
const inFlightMeaningRequests = new Map<string, Promise<string | null>>();

const normalizeWord = (word: string): string => word.trim().toLowerCase();

export type UpdateWordHuntProgressRequest = {
  isCompleted: boolean;
  progressPercent: number;
  score: number;
  hintsUsedToday: number;
  hintsUsedDate: string;
};

export const wordHuntApi = {
  getWordHuntLessons: (page: number = 0, size: number = 20) =>
    apiFetch<ApiResponse<PageResponse<WordHuntProgress>>>(
      `/word-hunt-lessons?page=${page}&size=${size}&sort=id,asc`
    ),

  getWordHuntLessonDetail: (lessonId: number) =>
    apiFetch<ApiResponse<WordHuntProgress>>(`/word-hunt-lessons/${lessonId}`),

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
      const translated = payload?.responseData?.translatedText;

      if (typeof translated !== 'string') {
        return null;
      }

      const cleaned = translated.trim();
      if (!cleaned || cleaned.toLowerCase() === normalizedWord) {
        return null;
      }

      return cleaned;
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
