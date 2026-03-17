package com.memoflow.memoflow.service;

import com.memoflow.memoflow.entity.Notification;

import java.util.List;
import java.util.Optional;

public interface NotificationService {

    List<Notification> findAll();

    Optional<Notification> findById(Long id);

    List<Notification> findByUserId(Long userId);

    List<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead);

    long countUnreadByUserId(Long userId);

    Notification save(Notification notification);

    Notification markAsRead(Long id);

    void markAllAsReadByUserId(Long userId);

    void deleteById(Long id);
}
