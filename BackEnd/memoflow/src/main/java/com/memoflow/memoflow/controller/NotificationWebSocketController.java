package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.handler.WebSocketEventHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for handling real-time notification subscriptions
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketController {

    private final WebSocketEventHandler webSocketEventHandler;

    /**
     * Handle device registration when user connects to WebSocket
     * Client sends: /app/register-device with message: {userId: 123, platform:
     * "WEB"}
     */
    @MessageMapping("/register-device")
    public void registerDevice(
            NotificationMessage message,
            SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();
        if (message.getUserId() != null && sessionId != null) {
            String platform = message.getPlatform() != null ? message.getPlatform() : "WEB";
            webSocketEventHandler.registerDevice(sessionId, message.getUserId(), platform);
        }
    }

    /**
     * Simple message class for notification registration
     */
    public static class NotificationMessage {
        private Long userId;
        private String platform;

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getPlatform() {
            return platform;
        }

        public void setPlatform(String platform) {
            this.platform = platform;
        }
    }
}
