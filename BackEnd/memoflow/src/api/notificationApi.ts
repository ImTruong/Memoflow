import { apiFetch } from './apiClient';

export type NotificationResponse = {
  id: number;
  type: string;
  title: string;
  message: string;
  imageUrl?: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  // Icon metadata from backend
  icon?: string;
  bgColor?: string;
  iconColor?: string;
  hasGradient?: boolean;
  hasAction?: boolean;
  actionText?: string;
};

export type PageResponse<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const notificationApi = {
  getNotifications: (page: number = 0, size: number = 20) =>
    apiFetch<ApiResponse<PageResponse<NotificationResponse>>>(`/notifications?page=${page}&size=${size}`),

  getUnreadCount: () =>
    apiFetch<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    apiFetch<ApiResponse<NotificationResponse>>(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllAsRead: () =>
    apiFetch<ApiResponse<void>>('/notifications/read-all', { method: 'PUT' }),

  deleteNotification: (id: number) =>
    apiFetch<ApiResponse<void>>(`/notifications/${id}`, { method: 'DELETE' }),
};

