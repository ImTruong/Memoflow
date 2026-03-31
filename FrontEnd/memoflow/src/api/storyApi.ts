import { apiFetch } from './apiClient';
import { ApiResponse, PageResponse } from '../types/flashcard';
import { UserLessonProgress } from '../types/story';

export const storyApi = {
  getStoryLessons: (page: number = 0, size: number = 20) =>
    apiFetch<ApiResponse<PageResponse<UserLessonProgress>>>(
      `/story-lessons?page=${page}&size=${size}&sort=id,desc`
    ),

  getStoryLessonDetail: (lessonId: number) =>
    apiFetch<ApiResponse<UserLessonProgress>>(
      `/story-lessons/${lessonId}`
    ),

  completeStoryLesson: (lessonId: number) =>
    apiFetch<ApiResponse<void>>(`/story-lessons/${lessonId}/complete`, {
      method: 'POST',
    }),
};
