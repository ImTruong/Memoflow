import { apiFetch } from './apiClient';
import { ApiResponse, PageResponse } from '../types/flashcard';
import { WordRaceLesson } from '../types/wordRace';

export const wordRaceApi = {
  getWordRaceLessons: (page: number = 0, size: number = 20) =>
    apiFetch<ApiResponse<PageResponse<WordRaceLesson>>>(
      `/word-race-lessons?page=${page}&size=${size}&sort=id,asc`
    ),

  getWordRaceLessonDetail: (lessonId: number) =>
    apiFetch<ApiResponse<WordRaceLesson>>(`/word-race-lessons/${lessonId}`),
};
