package com.memoflow.memoflow.service;

import com.memoflow.memoflow.entity.ChatSession;

import java.util.List;
import java.util.Optional;

public interface ChatSessionService {

    List<ChatSession> findAll();

    Optional<ChatSession> findById(Long id);

    List<ChatSession> findByUserId(Long userId);

    ChatSession save(ChatSession chatSession);

    ChatSession update(Long id, ChatSession chatSession);

    void deleteById(Long id);
}
