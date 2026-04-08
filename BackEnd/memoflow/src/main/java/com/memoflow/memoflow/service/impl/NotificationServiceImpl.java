package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.response.NotificationResponse;

import com.memoflow.memoflow.entity.Notification;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.enums.NotificationType;
import com.memoflow.memoflow.exception.ResourceNotFoundException;
import com.memoflow.memoflow.repository.NotificationRepository;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotifications(UserPrincipal userPrincipal, Pageable pageable) {
        var notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userPrincipal.getId(), LocalDateTime.now(), pageable);
        List<NotificationResponse> responses = notificationPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<NotificationResponse>builder()
                .content(responses)
                .pageNumber(notificationPage.getNumber())
                .pageSize(notificationPage.getSize())
                .totalElements(notificationPage.getTotalElements())
                .totalPages(notificationPage.getTotalPages())
                .last(notificationPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(UserPrincipal userPrincipal) {
        return notificationRepository.countByUserIdAndIsReadFalse(userPrincipal.getId(), LocalDateTime.now());
    }

    @Override
    public NotificationResponse markAsRead(Long id, UserPrincipal userPrincipal) {
        Notification notification = notificationRepository.findByIdAndUserId(id, userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notification = notificationRepository.save(notification);
        }
        return toResponse(notification);
    }

    @Override
    public void deleteNotification(Long id, UserPrincipal userPrincipal) {
        Notification notification = notificationRepository.findByIdAndUserId(id, userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notificationRepository.delete(notification);
    }

    @Override
    public NotificationResponse toResponse(Notification notification) {
        NotificationType type = NotificationType.fromString(notification.getType());

        NotificationResponse response = NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .icon(type.getIcon())
                .bgColor(type.getBgColor())
                .iconColor(type.getIconColor())
                .hasGradient(type.isHasGradient())
                .hasAction(type == NotificationType.STREAK_REMINDER)
                .actionText(type == NotificationType.STREAK_REMINDER ? "Học ngay" : null)
                .data(new HashMap<>())
                .build();

        if (notification.getImage() != null) {
            response.setImageUrl(notification.getImage().getUrl());
        }

        return response;
    }

    @Override
    public void broadcastToAll(String title, String body, Map<String, String> data) {
        try {
            Map<String, Object> notification = buildNotificationPayload(title, body, data);
            messagingTemplate.convertAndSend("/topic/notifications", (Object) notification);
            log.info("Broadcasted notification to all connected clients");
        } catch (Exception e) {
            log.error("Error broadcasting notification", e);
        }
    }

    private Map<String, Object> buildNotificationPayload(String title, String body, Map<String, String> data) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("body", body);
        payload.put("timestamp", System.currentTimeMillis());
        payload.put("data", data != null ? data : new HashMap<>());
        return payload;
    }

    @Override
    public Page<Notification> findByUserId(Long userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, LocalDateTime.now(), pageable);
    }

    @Override
    public long countUnreadByUserId(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId, LocalDateTime.now());
    }

    @Override
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notification = notificationRepository.save(notification);
        }
        return notification;
    }

    @Override
    public void markAllAsReadByUserId(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId, LocalDateTime.now());
        notifications.forEach(notification -> {
            if (!Boolean.TRUE.equals(notification.getIsRead())) {
                notification.setIsRead(true);
            }
        });
        notificationRepository.saveAll(notifications);
    }

    @Override
    public void deleteById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notificationRepository.delete(notification);
    }

    @Override
    public void sendToUser(Long userId, String title, String body, Map<String, String> data) {
        try {
            Map<String, Object> notification = buildNotificationPayload(title, body, data);
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    notification);
            log.info("Sent notification to user {}: {}", userId, title);
        } catch (Exception e) {
            log.error("Error sending notification to user " + userId, e);
        }
    }
}
