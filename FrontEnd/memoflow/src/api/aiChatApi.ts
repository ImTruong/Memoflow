import { apiFetch } from './apiClient';
import {
  AiChatMessageListResponse,
  AiChatMessageResponse,
  AiChatRole,
  AiChatSessionListResponse,
  AiChatSessionResponse,
} from '../types/aiChat';

export const aiChatApi = {
  // API noi bo: lay danh sach phien chat cua user.
  getSessions: () => apiFetch<AiChatSessionListResponse>('/ai/chat-sessions'),

  // API noi bo: tao phien chat moi, title co the bo trong.
  createSession: (title?: string) =>
    apiFetch<AiChatSessionResponse>('/ai/chat-sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  // API noi bo: lay lich su tin nhan cua mot phien chat.
  getMessages: (sessionId: number) =>
    apiFetch<AiChatMessageListResponse>(`/ai/chat-sessions/${sessionId}/messages`),

  // API noi bo: luu mot tin nhan user/assistant vao phien chat.
  saveMessage: (sessionId: number, role: AiChatRole, content: string) =>
    apiFetch<AiChatMessageResponse>(`/ai/chat-sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role, content }),
    }),
};
