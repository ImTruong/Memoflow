import { ApiResponse } from './flashcard';

// Vai tro cua tin nhan trong chatbot.
export type AiChatRole = 'user' | 'assistant';

// Tin nhan chat hien thi tren mobile.
export type AiChatMessage = {
  id: number;
  role: AiChatRole;
  content: string;
  createdAt: string;
};

// Phien chat AI trong danh sach lich su.
export type AiChatSession = {
  id: number;
  title: string;
  lastMessagePreview: string;
  createdAt: string;
  updatedAt: string;
};

// Kieu response API cho danh sach/phien/tin nhan AI chat.
export type AiChatSessionListResponse = ApiResponse<AiChatSession[]>;
export type AiChatSessionResponse = ApiResponse<AiChatSession>;
export type AiChatMessageListResponse = ApiResponse<AiChatMessage[]>;
export type AiChatMessageResponse = ApiResponse<AiChatMessage>;
