package com.memoflow.memoflow.service;

import java.util.List;

import com.memoflow.memoflow.dto.response.AiChatMessageResponse;
import com.memoflow.memoflow.dto.response.AiChatSessionResponse;

// Interface dinh nghia nghiep vu quan ly phien chat va tin nhan AI.
public interface AiChatService {

    // Lay danh sach phien chat cua user.
    List<AiChatSessionResponse> getUserSessions(Long userId);

    // Tao phien chat moi cho user.
    AiChatSessionResponse createSession(Long userId, String title);

    // Lay tin nhan trong mot phien chat thuoc user.
    List<AiChatMessageResponse> getSessionMessages(Long userId, Long sessionId);

    // Luu tin nhan user hoac assistant vao phien chat.
    AiChatMessageResponse saveMessage(Long userId, Long sessionId, String role, String content);
}
