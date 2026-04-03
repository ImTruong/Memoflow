package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND (n.scheduledTime IS NULL OR n.scheduledTime <= :now)")
    List<Notification> findByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND (n.scheduledTime IS NULL OR n.scheduledTime <= :now)")
    Page<Notification> findByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND (n.scheduledTime IS NULL OR n.scheduledTime <= :now) ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, @Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false AND (n.scheduledTime IS NULL OR n.scheduledTime <= :now)")
    long countByUserIdAndIsReadFalse(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT n FROM Notification n WHERE n.scheduledTime IS NOT NULL AND n.scheduledTime <= :now")
    List<Notification> findPendingScheduledNotifications(@Param("now") LocalDateTime now);
}
