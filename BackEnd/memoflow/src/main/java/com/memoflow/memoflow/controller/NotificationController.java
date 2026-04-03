package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.NotificationResponse;
import com.memoflow.memoflow.entity.Notification;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get paginated notifications for the authenticated user
     * GET /notifications?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Fetching notifications for user: {}, page: {}, size: {}", userPrincipal.getId(), page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notifications = notificationService.findByUserId(userPrincipal.getId(), pageable);
        Page<NotificationResponse> response = notifications
                .map(notification -> notificationService.toResponse(notification));

        return ResponseEntity.ok(ApiResponse.success(response, "Notifications retrieved successfully"));
    }

    /**
     * Get unread notification count for the authenticated user
     * GET /notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Fetching unread count for user: {}", userPrincipal.getId());

        long unreadCount = notificationService.countUnreadByUserId(userPrincipal.getId());

        return ResponseEntity.ok(ApiResponse.success(unreadCount, "Unread count retrieved successfully"));
    }

    /**
     * Mark a notification as read
     * PATCH /notifications/{id}/read
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        log.info("Marking notification {} as read for user: {}", id, userPrincipal.getId());

        NotificationResponse response = notificationService.markAsRead(id, userPrincipal);

        return ResponseEntity.ok(ApiResponse.success(response, "Notification marked as read"));
    }

    /**
     * Mark all notifications as read for the authenticated user
     * PUT /notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Marking all notifications as read for user: {}", userPrincipal.getId());

        notificationService.markAllAsReadByUserId(userPrincipal.getId());

        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }

    /**
     * Delete a notification
     * DELETE /notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        log.info("Deleting notification {} for user: {}", id, userPrincipal.getId());

        notificationService.deleteNotification(id, userPrincipal);

        return ResponseEntity.ok(ApiResponse.success(null, "Notification deleted successfully"));
    }

    /**
     * Test endpoint to broadcast a notification to all connected clients via
     * WebSocket
     * POST /notifications/test/broadcast
     */
    @PostMapping("/test/broadcast")
    public ResponseEntity<ApiResponse<String>> testBroadcastNotification(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        log.info("Broadcasting test notification from user: {}", userPrincipal.getId());

        Map<String, String> data = new HashMap<>();
        data.put("userId", userPrincipal.getId().toString());
        data.put("timestamp", String.valueOf(System.currentTimeMillis()));

        notificationService.broadcastToAll(
                "🎉 Test Notification",
                "Đây là thông báo test từ server! Notification system đang hoạt động tốt.",
                data);

        return ResponseEntity.ok(ApiResponse.success(
                "Test notification broadcasted successfully",
                "Notification sent to all connected WebSocket clients"));
    }
}
