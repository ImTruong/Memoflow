import { apiFetch } from './apiClient';
import { ApiResponse, PageResponse } from '../types/flashcard';

export type ListeningLessonResponse = {
  id: number;
  title: string;
  isCompleted: boolean;
  progressPercent: number;
};

export type ListeningLessonDetailResponse = {
  lessonId: number;
  title: string;
  type: string;
  groups: {
    groupId: number;
    audio?: { url: string };
    images?: { url: string };
    quizzes: {
      quizId: number;
      questionText: string;
      options: {
        optionId: number;
        optionText: string;
      }[];
    }[];
  }[];
};

export type LessonSubmissionResponse = {
  lessonId: number;
  answers: {
    quizId: number;
    optionId: number;
  }[];
};

export type ListeningResultResponse = {
  lessonId: number;
  title: string;
  type: string;
  totalQuestion: number;
  score: number;
  groups: {
    groupId: number;
    audio?: { url: string };
    images?: { url: string };
    transcript?: string;
    translation?: string;
    quizzes: {
      quizId: number;
      questionText: string;
      translation?: string;
      userAnswer?: number;
      options: {
        optionId: number;
        optionText: string;
        correct: boolean;
      }[];
    }[];
  }[];
};

export const listeningApi = {
  getListeningLessons: (part: number, status?: string, page: number = 0, size: number = 20) =>
    apiFetch<ApiResponse<PageResponse<ListeningLessonResponse>>>(
      `/listening-lessons?part=${part}&status=${status ?? ''}&page=${page}&size=${size}&sort=title`
    ),

  getListeningLessonDetail: (lessonId: number) =>
    apiFetch<ApiResponse<ListeningLessonDetailResponse>>(
      `/listening-lessons/${lessonId}`
    ),

  submitLesson: (payload: { lessonId: number; answers: { quizId: number; optionId: number }[] }, isSubmit: boolean) =>
    apiFetch<ApiResponse<any>>(
      `/listening-lessons/${payload.lessonId}/${isSubmit ? 'submit' : 'draft'}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  getLessonSubmission: (lessonId: number) =>
    apiFetch<ApiResponse<LessonSubmissionResponse>>(
      `/listening-lessons/${lessonId}/submission`
    ),

  getListeningResult: (lessonId: number) =>
    apiFetch<ApiResponse<ListeningResultResponse>>(
      `/listening-lessons/${lessonId}/result`
    ),

};