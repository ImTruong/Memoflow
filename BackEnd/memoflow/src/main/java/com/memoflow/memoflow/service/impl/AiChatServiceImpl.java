package com.memoflow.memoflow.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.memoflow.memoflow.dto.response.AiChatMessageResponse;
import com.memoflow.memoflow.dto.response.AiChatSessionResponse;
import com.memoflow.memoflow.entity.ChatSession;
import com.memoflow.memoflow.entity.Message;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.ChatSessionRepository;
import com.memoflow.memoflow.repository.MessageRepository;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.service.AiChatService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AiChatServiceImpl implements AiChatService {

    private static final String DEFAULT_SESSION_TITLE = "Cuộc trò truyện mới";

    private final ChatSessionRepository chatSessionRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AiChatSessionResponse> getUserSessions(Long userId) {
        return chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toSessionResponse)
                .toList();
    }

    @Override
    public AiChatSessionResponse createSession(Long userId, String title) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        ChatSession saved = chatSessionRepository.save(ChatSession.builder()
                .user(user)
                .title(normalizeSessionTitle(title))
                .build());

        return toSessionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiChatMessageResponse> getSessionMessages(Long userId, Long sessionId) {
        ChatSession session = findOwnedSession(userId, sessionId);
        return messageRepository.findByChatSessionIdOrderByCreatedAtAsc(session.getId())
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Override
    public AiChatMessageResponse saveMessage(Long userId, Long sessionId, String role, String content) {
        ChatSession session = findOwnedSession(userId, sessionId);

        String normalizedRole = normalizeRole(role);
        String normalizedContent = normalizeInput(content);

        Message savedMessage = messageRepository.save(Message.builder()
                .chatSession(session)
                .role(normalizedRole)
                .content(normalizedContent)
                .build());

        if ("user".equals(normalizedRole) && !StringUtils.hasText(session.getTitle())) {
            session.setTitle(buildTitleFromInput(normalizedContent));
        }

        session.setUpdatedAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        return toMessageResponse(savedMessage);
    }

    private ChatSession findOwnedSession(Long userId, Long sessionId) {
        return chatSessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", "id", sessionId));
    }

    private String normalizeRole(String role) {
        if (!StringUtils.hasText(role)) {
            throw new IllegalArgumentException("Message role is required");
        }

        String normalized = role.trim().toLowerCase(Locale.ROOT);
        if (!"user".equals(normalized) && !"assistant".equals(normalized)) {
            throw new IllegalArgumentException("Role must be either 'user' or 'assistant'");
        }

        return normalized;
    }

    private String normalizeInput(String input) {
        if (!StringUtils.hasText(input)) {
            throw new IllegalArgumentException("Message content is required");
        }

        return input.trim();
    }

    private String normalizeSessionTitle(String title) {
        if (!StringUtils.hasText(title)) {
            return DEFAULT_SESSION_TITLE;
        }

        String normalized = title.trim();
        return normalized.length() > 120 ? normalized.substring(0, 120) : normalized;
    }

    private String buildTitleFromInput(String userInput) {
        String normalized = userInput.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= 48) {
            return normalized;
        }

        return normalized.substring(0, 48).trim() + "...";
    }

    private AiChatSessionResponse toSessionResponse(ChatSession chatSession) {
        String lastMessage = messageRepository.findTopByChatSessionIdOrderByCreatedAtDesc(chatSession.getId())
                .map(message -> message.getContent().length() > 90
                        ? message.getContent().substring(0, 90).trim() + "..."
                        : message.getContent())
                .orElse("Bat dau cuoc tro chuyen");

        return AiChatSessionResponse.builder()
                .id(chatSession.getId())
                .title(normalizeSessionTitle(chatSession.getTitle()))
                .lastMessagePreview(lastMessage)
                .createdAt(chatSession.getCreatedAt())
                .updatedAt(chatSession.getUpdatedAt())
                .build();
    }

    private AiChatMessageResponse toMessageResponse(Message message) {
        return AiChatMessageResponse.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
