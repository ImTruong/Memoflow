package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.ChatSession;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.ChatSessionRepository;
import com.memoflow.memoflow.service.ChatSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatSessionServiceImpl implements ChatSessionService {

    private final ChatSessionRepository chatSessionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ChatSession> findAll() {
        return chatSessionRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ChatSession> findById(Long id) {
        return chatSessionRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatSession> findByUserId(Long userId) {
        return chatSessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public ChatSession save(ChatSession chatSession) {
        return chatSessionRepository.save(chatSession);
    }

    @Override
    public ChatSession update(Long id, ChatSession chatSession) {
        chatSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", "id", id));
        chatSession.setId(id);
        return chatSessionRepository.save(chatSession);
    }

    @Override
    public void deleteById(Long id) {
        chatSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", "id", id));
        chatSessionRepository.deleteById(id);
    }
}
