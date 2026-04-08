import { ApiResponse } from './flashcard';

export type AiChatRole = 'user' | 'assistant';

export type AiChatMessage = {
  id: number;
  role: AiChatRole;
  content: string;
  createdAt: string;
};

export type AiChatSession = {
  id: number;
  title: string;
  lastMessagePreview: string;
  createdAt: string;
  updatedAt: string;
};

export type AiChatSessionListResponse = ApiResponse<AiChatSession[]>;
export type AiChatSessionResponse = ApiResponse<AiChatSession>;
export type AiChatMessageListResponse = ApiResponse<AiChatMessage[]>;
export type AiChatMessageResponse = ApiResponse<AiChatMessage>;
