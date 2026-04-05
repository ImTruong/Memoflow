package com.memoflow.memoflow.service;

import java.util.List;
import java.util.Map;

/**
 * Service interface for sending push notifications via Socket.IO
 */
public interface SocketPushNotificationService {

    /**
     * Send push notification to a single socket session
     * 
     * @param socketSessionId Socket.IO session ID
     * @param title           Notification title
     * @param body            Notification body
     * @param data            Additional data payload (optional)
     * @return Success status
     */
    boolean sendToSocket(String socketSessionId, String title, String body, Map<String, String> data);

    /**
     * Send push notification to multiple socket sessions
     * 
     * @param socketSessionIds List of Socket.IO session IDs
     * @param title            Notification title
     * @param body             Notification body
     * @param data             Additional data payload (optional)
     * @return Number of successful sends
     */
    int sendToMultipleSockets(List<String> socketSessionIds, String title, String body, Map<String, String> data);

    /**
     * Send push notification to all connected sockets of a user
     * 
     * @param userId User ID
     * @param title  Notification title
     * @param body   Notification body
     * @param data   Additional data payload (optional)
     * @return Number of successful sends
     */
    int sendToUser(Long userId, String title, String body, Map<String, String> data);

    /**
     * Broadcast push notification to all connected clients
     * 
     * @param title Notification title
     * @param body  Notification body
     * @param data  Additional data payload (optional)
     */
    void broadcastToAll(String title, String body, Map<String, String> data);
}
