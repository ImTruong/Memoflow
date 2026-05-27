import { apiFetch } from './apiClient';
import { ApiResponse, PageResponse } from '../types/flashcard';
import { UserLessonProgress } from '../types/story';

export const storyApi = {
  // API noi bo: lay danh sach truyen chem kem tien do doc cua user.
  getStoryLessons: (page: number = 0, size: number = 20) =>
    apiFetch<ApiResponse<PageResponse<UserLessonProgress>>>(
      `/story-lessons?page=${page}&size=${size}&sort=id,desc`
    ),

  // API noi bo: lay chi tiet mot truyen chem.
  getStoryLessonDetail: (lessonId: number) =>
    apiFetch<ApiResponse<UserLessonProgress>>(
      `/story-lessons/${lessonId}`
    ),

  // API noi bo: danh dau user da hoan thanh truyen chem.
  completeStoryLesson: (lessonId: number) =>
    apiFetch<ApiResponse<void>>(`/story-lessons/${lessonId}/complete`, {
      method: 'POST',
    }),
};
