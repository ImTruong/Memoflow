import { apiFetch } from './apiClient';
import { ApiResponse, PageResponse } from '../types/flashcard';
import { WordRaceLesson } from '../types/wordRace';

export const wordRaceApi = {
  // API noi bo: lay danh sach man Word Race cho mobile.
  getWordRaceLessons: (page: number = 0, size: number = 20) =>
    apiFetch<ApiResponse<PageResponse<WordRaceLesson>>>(
      `/word-race-lessons?page=${page}&size=${size}&sort=id,asc`
    ),

  // API noi bo: lay chi tiet cau hinh mot man Word Race.
  getWordRaceLessonDetail: (lessonId: number) =>
    apiFetch<ApiResponse<WordRaceLesson>>(`/word-race-lessons/${lessonId}`),
};
