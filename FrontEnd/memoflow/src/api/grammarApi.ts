import { apiFetch } from './apiClient';
import { ApiResponse } from '../types/flashcard';
import {
  GrammarTopicResponse,
  GrammarTopicDetailResponse,
  GrammarLessonDetailResponse,
  GrammarPracticeOverviewResponse,
  GrammarPracticeDetailResponse,
  GrammarPracticeQuizResponse,
  GrammarPracticeSubmissionResponse,
  GrammarPracticeResultResponse,
} from '../types/grammar';

export type GrammarSubmitAnswer = {
  quizId: number;
  optionId?: number | null;
  textAnswer?: string | null;
};

export const grammarApi = {
  getTopics: () =>
    apiFetch<ApiResponse<GrammarTopicResponse[]>>('/grammar/topics'),

  getTopicDetail: (topicId: number) =>
    apiFetch<ApiResponse<GrammarTopicDetailResponse>>(`/grammar/topics/${topicId}`),

  getLessonDetail: (lessonId: number) =>
    apiFetch<ApiResponse<GrammarLessonDetailResponse>>(`/grammar/lessons/${lessonId}`),

  getPracticeOverview: () =>
    apiFetch<ApiResponse<GrammarPracticeOverviewResponse[]>>('/grammar/practices'),

  getPracticeDetail: (practiceId: number) =>
    apiFetch<ApiResponse<GrammarPracticeDetailResponse>>(`/grammar/practices/${practiceId}`),

  getPracticeQuiz: (practiceId: number) =>
    apiFetch<ApiResponse<GrammarPracticeQuizResponse>>(`/grammar/practices/${practiceId}/quiz`),

  submitPractice: (practiceId: number, answers: GrammarSubmitAnswer[], isSubmit = true) =>
    apiFetch<ApiResponse<void>>(`/grammar/practices/${practiceId}/${isSubmit ? 'submit' : 'draft'}`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  getPracticeSubmission: (practiceId: number) =>
    apiFetch<ApiResponse<GrammarPracticeSubmissionResponse>>(`/grammar/practices/${practiceId}/submission`),

  getPracticeResult: (practiceId: number) =>
    apiFetch<ApiResponse<GrammarPracticeResultResponse>>(`/grammar/practices/${practiceId}/result`),
};
