package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);

    List<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead);

    long countByUserIdAndIsReadFalse(Long userId);
}
