import { apiFetch } from './apiClient';
import { 
  ApiResponse, 
  PageResponse, 
  LessonSummary, 
  FlashcardLessonResponse, 
  WordResponse, 
  FlashcardLessonDetailResponse,
  FlashcardReviewResponse,
  HeatmapData,
  DailyStudyStats
} from '../types/flashcard';

export type CreateFlashcardLessonRequest = {
  title: string;
  description?: string;
  privacyMode: 'PUBLIC' | 'PRIVATE';
  image?: any;
};

export const flashcardApi = {
  getMyLessons: (page: number, size: number) => 
    apiFetch<ApiResponse<PageResponse<LessonSummary>>>(
      `/flashcard-lessons/my?page=${page}&size=${size}&sort=id,desc`
    ),

  getCommunityLessons: (page: number, size: number) => 
    apiFetch<ApiResponse<PageResponse<LessonSummary>>>(
      `/flashcard-lessons/community?page=${page}&size=${size}&sort=id,desc`
    ),

  getLessonDetail: (id: number, page: number = 0, size: number = 10) =>
    apiFetch<ApiResponse<FlashcardLessonDetailResponse>>(
      `/flashcard-lessons/${id}?page=${page}&size=${size}`
    ),

  getLessonWords: (id: number, page: number, size: number, keyword?: string) => {
    let url = `/flashcard-lessons/${id}/words?page=${page}&size=${size}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    return apiFetch<ApiResponse<PageResponse<WordResponse>>>(url);
  },
 
  getDueWords: (id: number, page: number, size: number) => 
    apiFetch<ApiResponse<PageResponse<WordResponse>>>(
      `/flashcard-lessons/${id}/due-words?page=${page}&size=${size}`
    ),

  getAllUserDueWords: (page: number, size: number) => 
    apiFetch<ApiResponse<PageResponse<WordResponse>>>(
      `/words/due?page=${page}&size=${size}`
    ),

  createLesson: (activityId: number, data: CreateFlashcardLessonRequest) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('privacyMode', data.privacyMode);
    
    if (data.image && (data.image.startsWith('file://') || data.image.startsWith('content://'))) {
      formData.append('image', {
        uri: data.image,
        name: 'lesson_image.jpg',
        type: 'image/jpeg',
      } as any);
    }

    return apiFetch<ApiResponse<FlashcardLessonResponse>>(
      `/learning-activities/${activityId}/flashcard-lessons`, 
      {
        method: 'POST',
        body: formData,
      }
    );
  },

  updateLesson: (id: number, data: CreateFlashcardLessonRequest) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('privacyMode', data.privacyMode);
    
    if (data.image && (data.image.startsWith('file://') || data.image.startsWith('content://'))) {
      formData.append('image', {
        uri: data.image,
        name: 'lesson_image.jpg',
        type: 'image/jpeg',
      } as any);
    }

    return apiFetch<ApiResponse<FlashcardLessonResponse>>(
      `/flashcard-lessons/${id}`, 
      {
        method: 'PUT',
        body: formData,
      }
    );
  },

  deleteLesson: (id: number) =>
    apiFetch<ApiResponse<void>>(`/flashcard-lessons/${id}`, {
      method: 'DELETE',
    }),

  createWord: (lessonId: number, data: any) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('ipa', data.ipa);
    formData.append('definition', data.definition);
    formData.append('example', data.example);
    if (data.audioUrl) formData.append('audioUrl', data.audioUrl);
    if (data.image && (data.image.startsWith('file://') || data.image.startsWith('content://'))) {
      formData.append('image', {
        uri: data.image,
        name: 'word_image.jpg',
        type: 'image/jpeg',
      } as any);
    }
    return apiFetch<ApiResponse<WordResponse>>(`/flashcard-lessons/${lessonId}/words`, {
      method: 'POST',
      body: formData,
    });
  },

  updateWord: (id: number, data: any) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('ipa', data.ipa);
    formData.append('definition', data.definition);
    formData.append('example', data.example);
    if (data.audioUrl) formData.append('audioUrl', data.audioUrl);
    if (data.image && (data.image.startsWith('file://') || data.image.startsWith('content://'))) {
      formData.append('image', {
        uri: data.image,
        name: 'word_image.jpg',
        type: 'image/jpeg',
      } as any);
    }
    return apiFetch<ApiResponse<WordResponse>>(`/words/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  deleteWord: (id: number) =>
    apiFetch<ApiResponse<void>>(`/words/${id}`, {
      method: 'DELETE',
    }),

  recordReview: (wordId: number, difficulty: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') =>
    apiFetch<ApiResponse<any>>(`/words/${wordId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ difficulty }),
    }),

  getDailyStats: () =>
    apiFetch<ApiResponse<DailyStudyStats>>('/flashcard-reviews/daily-stats'),

  getReviewHistory: (date?: string, page: number = 0, size: number = 10) => {
    let url = `/flashcard-reviews/history?page=${page}&size=${size}`;
    if (date) url += `&date=${date}`;
    return apiFetch<ApiResponse<PageResponse<FlashcardReviewResponse>>>(url);
  },

  getHeatmapData: (month: number, year: number) =>
    apiFetch<ApiResponse<HeatmapData[]>>(`/flashcard-reviews/heatmap?month=${month}&year=${year}`),

  searchReviews: (keyword: string, page: number = 0, size: number = 10) =>
    apiFetch<ApiResponse<PageResponse<FlashcardReviewResponse>>>(
      `/flashcard-reviews/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    ),

  getRecommendedWords: () => 
    apiFetch<ApiResponse<string[]>>('/suggestions/recommended-words'),
};
