import { apiFetch } from './apiClient';
import {
  AiChatMessageListResponse,
  AiChatMessageResponse,
  AiChatRole,
  AiChatSessionListResponse,
  AiChatSessionResponse,
} from '../types/aiChat';

export const aiChatApi = {
  getSessions: () => apiFetch<AiChatSessionListResponse>('/ai/chat-sessions'),

  createSession: (title?: string) =>
    apiFetch<AiChatSessionResponse>('/ai/chat-sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  getMessages: (sessionId: number) =>
    apiFetch<AiChatMessageListResponse>(`/ai/chat-sessions/${sessionId}/messages`),

  saveMessage: (sessionId: number, role: AiChatRole, content: string) =>
    apiFetch<AiChatMessageResponse>(`/ai/chat-sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role, content }),
    }),
};
