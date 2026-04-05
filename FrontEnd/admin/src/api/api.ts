import axios from 'axios';

const API_URL = 'http://localhost:8080';
const DICTIONARY_EN_ENDPOINT = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const ENGLISH_WORD_PATTERN = /^[A-Za-z]+(?:['-][A-Za-z]+)*$/;

const englishWordCheckCache = new Map<string, boolean>();

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PageResponse<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type StoryLessonPayload = {
  title: string;
  description?: string;
  englishTitle?: string;
  paragraphs: string[];
  vocabulary?: Array<{ word: string }>;
};

export type WordRaceLessonPayload = {
  title: string;
  description?: string;
  targetScore: number;
  timeLimit: number;
  forbiddenEndings: string[];
};

export type WordHuntLessonPayload = {
  title: string;
  description?: string;
  categoryKey: string;
  categoryLabel: string;
  boardSize: number;
  timeLimitSeconds: number;
  targetWordCount: number;
  maxHintsPerDay: number;
  objectiveText: string;
  unlockRequirementText?: string;
  words: string[];
};

const buildStoryFormData = (payload: StoryLessonPayload, image?: File | null): FormData => {
  const formData = new FormData();
  formData.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

  if (image) {
    formData.append('image', image);
  }

  return formData;
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const wordValidationApi = {
  isEnglishWord: async (word: string): Promise<boolean> => {
    const normalized = word.trim().toLowerCase();
    if (!normalized || !ENGLISH_WORD_PATTERN.test(normalized)) {
      return false;
    }

    const cached = englishWordCheckCache.get(normalized);
    if (typeof cached === 'boolean') {
      return cached;
    }

    try {
      const response = await fetch(`${DICTIONARY_EN_ENDPOINT}/${encodeURIComponent(normalized)}`);
      if (!response.ok) {
        englishWordCheckCache.set(normalized, false);
        return false;
      }

      const payload = (await response.json()) as unknown;
      const isValid = Array.isArray(payload) && payload.length > 0;
      englishWordCheckCache.set(normalized, isValid);
      return isValid;
    } catch {
      return false;
    }
  },
};

export const adminApi = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  changeRole: async (userId: string, roleId: number) => {
    const response = await api.put(`/admin/users/${userId}/role?roleId=${roleId}`);
    return response.data;
  },
  changePassword: async (userId: string, newPassword: string) => {
    const response = await api.put(`/admin/users/${userId}/password?newPassword=${newPassword}`);
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  // Flashcard Management
  getFlashcards: async (page = 0, size = 10) => {
    const response = await api.get(`/admin/flashcard-lessons?page=${page}&size=${size}`);
    return response.data;
  },
  deleteFlashcard: async (id: string | number) => {
    const response = await api.delete(`/admin/flashcard-lessons/${id}`);
    return response.data;
  },
  getFlashcardWords: async (id: string | number) => {
    const response = await api.get(`/admin/flashcard-lessons/${id}`);
    return response.data;
  },

  // Story lesson management (Truyen chem)
  getStoryLessons: async (page = 0, size = 10) => {
    const response = await api.get(`/story-lessons?page=${page}&size=${size}&sort=id,desc`);
    return response.data;
  },
  getStoryLessonDetail: async (id: string | number) => {
    const response = await api.get(`/story-lessons/${id}`);
    return response.data;
  },
  createStoryLesson: async (learningActivityId: number, payload: StoryLessonPayload, image?: File | null) => {
    const formData = buildStoryFormData(payload, image);
    const response = await api.post(`/learning-activities/${learningActivityId}/story-lessons`, formData);
    return response.data;
  },
  updateStoryLesson: async (id: string | number, payload: StoryLessonPayload, image?: File | null) => {
    const formData = buildStoryFormData(payload, image);
    const response = await api.put(`/story-lessons/${id}`, formData);
    return response.data;
  },
  deleteStoryLesson: async (id: string | number) => {
    const response = await api.delete(`/story-lessons/${id}`);
    return response.data;
  },

  // Bilingual lesson management (Song ngữ)
  getBilingualLessons: async (
    page = 0,
    size = 10,
    keyword = '',
    sort = 'newest',
    readFilter = 'all',
  ) => {
    const response = await api.get(
      `/bilingual?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}&_sort=${sort}&readFilter=${readFilter}`,
    );
    return response.data;
  },
  getBilingualLessonDetail: async (id: string | number) => {
    const response = await api.get(`/bilingual/${id}`);
    return response.data;
  },
  createBilingualLesson: async (payload: unknown, file?: File | null) => {
    const formData = new FormData();
    formData.append('lesson', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }
    const response = await api.post('/bilingual', formData);
    return response.data;
  },
  updateBilingualLesson: async (id: string | number, payload: unknown, file?: File | null) => {
    const formData = new FormData();
    formData.append('lesson', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }
    const response = await api.put(`/bilingual/${id}`, formData);
    return response.data;
  },
  deleteBilingualLesson: async (id: string | number) => {
    const response = await api.delete(`/bilingual/${id}`);
    return response.data;
  },
  uploadBilingualLesson: async (excelFile: File, file?: File | null) => {
    const formData = new FormData();
    formData.append('excel', excelFile);
    if (file) {
      formData.append('file', file);
    }
    const response = await api.post('/bilingual/upload', formData);
    return response.data;
  },

  // Listening lesson management (Luyện nghe)
  getListeningLessons: async (
    page = 0,
    size = 10,
    part = 1,
    status = 'all',
  ) => {
    const response = await api.get(`/listening-lessons?page=${page}&size=${size}&sort=title&part=${part}&status=${status}`);
    return response.data;
  },
  getListeningLessonDetail: async (id: string | number) => {
    const response = await api.get(`/listening-lessons/${id}`);
    return response.data;
  },
  uploadListeningLessonExcel: async (excelFile: File) => {
    const formData = new FormData();
    formData.append('excel', excelFile);
    const response = await api.post('/listening-lessons/upload', formData);
    return response.data;
  },
  createListeningLesson: async (payload: unknown, audios: File[], images: File[]) => {
    const formData = new FormData();
    formData.append('lesson', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    audios.forEach((audio) => formData.append('audios', audio));
    images.forEach((image) => formData.append('images', image));
    const response = await api.post('/listening-lessons', formData);
    return response.data;
  },
  updateListeningLesson: async (id: string | number, payload: unknown, audios: File[], images: File[]) => {
    const formData = new FormData();
    formData.append('lesson', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    audios.forEach((audio) => formData.append('audios', audio));
    images.forEach((image) => formData.append('images', image));
    const response = await api.put(`/listening-lessons/${id}`, formData);
    return response.data;
  },
  deleteListeningLesson: async (id: string | number) => {
    const response = await api.delete(`/listening-lessons/${id}`);
    return response.data;
  },

  // Word race management (Dua tu voi Bot)
  getWordRaceLessons: async (page = 0, size = 10) => {
    const response = await api.get(`/word-race-lessons?page=${page}&size=${size}&sort=id,desc`);
    return response.data;
  },
  getWordRaceLessonDetail: async (id: string | number) => {
    const response = await api.get(`/word-race-lessons/${id}`);
    return response.data;
  },
  createWordRaceLesson: async (learningActivityId: number, payload: WordRaceLessonPayload) => {
    const response = await api.post(`/learning-activities/${learningActivityId}/word-race-lessons`, payload);
    return response.data;
  },
  updateWordRaceLesson: async (id: string | number, payload: WordRaceLessonPayload) => {
    const response = await api.put(`/word-race-lessons/${id}`, payload);
    return response.data;
  },
  deleteWordRaceLesson: async (id: string | number) => {
    const response = await api.delete(`/word-race-lessons/${id}`);
    return response.data;
  },

  // Word hunt management (Tinh mat tim tu)
  getWordHuntLessons: async (page = 0, size = 10) => {
    const response = await api.get(`/word-hunt-lessons?page=${page}&size=${size}&sort=id,desc`);
    return response.data;
  },
  getWordHuntLessonDetail: async (id: string | number) => {
    const response = await api.get(`/word-hunt-lessons/${id}`);
    return response.data;
  },
  createWordHuntLesson: async (learningActivityId: number, payload: WordHuntLessonPayload) => {
    const response = await api.post(`/learning-activities/${learningActivityId}/word-hunt-lessons`, payload);
    return response.data;
  },
  updateWordHuntLesson: async (id: string | number, payload: WordHuntLessonPayload) => {
    const response = await api.put(`/word-hunt-lessons/${id}`, payload);
    return response.data;
  },
  deleteWordHuntLesson: async (id: string | number) => {
    const response = await api.delete(`/word-hunt-lessons/${id}`);
    return response.data;
  },
};

export default api;
