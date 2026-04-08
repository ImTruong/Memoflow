import { apiFetch } from './apiClient';
import { ApiResponse, PageResponse } from '../types/flashcard';

export type BilingualResponse = {
  id: number;
  title: string;
  description: string;
  content: {
    createdAt: string;
    views: number;
    paragraphs: {
      en: string;
      vi: string;
      order: number;
    }[];
  };
  media?: {
    url: string;
  };
  isRead: boolean;
};

export const bilingualApi = {

  searchBilingual: (
    keyword: string,
    page: number = 0,
    size: number = 10,
    _sort: string = 'newest',
    readFilter: string = 'all'
  ) =>
    apiFetch<ApiResponse<PageResponse<BilingualResponse>>>(
      `/bilingual?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}&_sort=${_sort}&readFilter=${readFilter}`
    ),

  getBilingualDetail: (id: number) =>
    apiFetch<ApiResponse<BilingualResponse>>(
      `/bilingual/${id}`
    ),

  updateViewStatus: (id: number) =>
    apiFetch<ApiResponse<void>>(`/bilingual/${id}/seen`, {
      method: 'POST',
    }),
};