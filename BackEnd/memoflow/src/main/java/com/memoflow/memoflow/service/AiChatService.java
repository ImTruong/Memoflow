package com.memoflow.memoflow.service;

import java.util.List;

import com.memoflow.memoflow.dto.response.AiChatMessageResponse;
import com.memoflow.memoflow.dto.response.AiChatSessionResponse;

public interface AiChatService {

    List<AiChatSessionResponse> getUserSessions(Long userId);

    AiChatSessionResponse createSession(Long userId, String title);

    List<AiChatMessageResponse> getSessionMessages(Long userId, Long sessionId);

    AiChatMessageResponse saveMessage(Long userId, Long sessionId, String role, String content);
}
