package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.response.NotificationResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.entity.Notification;
import com.memoflow.memoflow.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Map;

public interface NotificationService {
    PageResponse<NotificationResponse> getNotifications(UserPrincipal userPrincipal, Pageable pageable);

    long countUnread(UserPrincipal userPrincipal);

    NotificationResponse markAsRead(Long id, UserPrincipal userPrincipal);

    void deleteNotification(Long id, UserPrincipal userPrincipal);

    void broadcastToAll(String title, String body, Map<String, String> data);

    // Additional methods needed by controller
    Page<Notification> findByUserId(Long userId, Pageable pageable);

    long countUnreadByUserId(Long userId);

    Notification markAsRead(Long id);

    void markAllAsReadByUserId(Long userId);

    void deleteById(Long id);

    NotificationResponse toResponse(Notification notification);

    // WebSocket notification methods
    void sendToUser(Long userId, String title, String body, Map<String, String> data);
}
