import { apiFetch } from './apiClient';
import type { ApiResponse, PageResponse } from '../types/flashcard';

export type NotificationResponse = {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  icon?: string;
  bgColor?: string;
  iconColor?: string;
  hasGradient?: boolean;
  hasAction?: boolean;
  actionText?: string | null;
  imageUrl?: string | null;
  data?: Record<string, string>;
};

export const notificationApi = {
  getNotifications: (page: number, size: number) =>
    apiFetch<ApiResponse<PageResponse<NotificationResponse>>>(
      `/notifications?page=${page}&size=${size}&sort=createdAt,desc`
    ),

  getUnreadCount: () =>
    apiFetch<ApiResponse<number>>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    apiFetch<ApiResponse<NotificationResponse>>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  deleteNotification: (id: number) =>
    apiFetch<ApiResponse<void>>(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};

