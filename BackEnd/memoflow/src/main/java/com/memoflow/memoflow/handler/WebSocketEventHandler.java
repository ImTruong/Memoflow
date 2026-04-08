package com.memoflow.memoflow.handler;

import com.memoflow.memoflow.entity.DeviceToken;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.repository.DeviceTokenRepository;
import com.memoflow.memoflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

/**
 * Handler for WebSocket STOMP events
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventHandler {

    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        log.info("WebSocket client connected: {}", sessionId);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();

        // Clean up device token on disconnect
        deviceTokenRepository.deleteBySocketSessionId(sessionId);
        log.info("WebSocket client disconnected and cleaned up: {}", sessionId);
    }

    @EventListener
    public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        String destination = headers.getDestination();
        log.info("WebSocket client subscribed to {}: {}", destination, sessionId);
    }

    /**
     * Register device when user connects to notification channel
     * Called via messaging endpoint
     */
    public void registerDevice(String sessionId, Long userId, String platform) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.warn("User not found: {}", userId);
                return;
            }

            boolean exists = deviceTokenRepository.existsBySocketSessionId(sessionId);
            if (exists) {
                DeviceToken token = deviceTokenRepository.findBySocketSessionId(sessionId).orElse(null);
                if (token != null) {
                    token.setUser(user);
                    token.setPlatform(platform);
                    deviceTokenRepository.save(token);
                    log.info("Updated device registration for session: {} user: {}", sessionId, userId);
                }
            } else {
                DeviceToken token = DeviceToken.builder()
                        .socketSessionId(sessionId)
                        .token(sessionId)
                        .platform(platform)
                        .user(user)
                        .build();
                deviceTokenRepository.save(token);
                log.info("Registered device for user: {} with session: {}", userId, sessionId);
            }
        } catch (Exception e) {
            log.error("Error during device registration", e);
        }
    }
}
