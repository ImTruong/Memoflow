import { apiFetch } from './apiClient';
import { ApiResponse } from '../types/flashcard';

export type SettingResponse = {
  studyReminderEnabled: boolean;
  streakReminderEnabled: boolean;
  timeWindow: boolean;
  morningReminderTime: string; // HH:mm:ss
  eveningReminderTime: string; // HH:mm:ss
};

export type UpdateSettingRequest = {
  studyReminderEnabled?: boolean;
  streakReminderEnabled?: boolean;
  timeWindow?: boolean;
  morningReminderTime?: string;
  eveningReminderTime?: string;
};

export const settingApi = {
  getSettings: () => 
    apiFetch<ApiResponse<SettingResponse>>('/settings'),

  updateSettings: (data: UpdateSettingRequest) => 
    apiFetch<ApiResponse<SettingResponse>>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
