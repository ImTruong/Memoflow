package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.entity.Notification;
import com.memoflow.memoflow.entity.Setting;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.enums.NotificationType;
import com.memoflow.memoflow.repository.FlashcardReviewRepository;
import com.memoflow.memoflow.repository.NotificationRepository;
import com.memoflow.memoflow.repository.SettingRepository;
import com.memoflow.memoflow.repository.UserLessonProgressRepository;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.service.NotificationSchedulerService;
import com.memoflow.memoflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationSchedulerServiceImpl implements NotificationSchedulerService {

    private final SettingRepository settingRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final FlashcardReviewRepository flashcardReviewRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;

    /**
     * Run every minute to check for users who need morning reminders
     * Checks if current time matches user's morning reminder time (within 1 minute
     * window)
     */
    @Override
    @Scheduled(cron = "0 * * * * *") // Every minute
    @Transactional
    public void sendMorningReminders() {
        LocalTime now = LocalTime.now();
        LocalTime startWindow = now.minusMinutes(1);
        LocalTime endWindow = now.plusMinutes(1);

        List<Setting> settings = settingRepository.findUsersForMorningReminder(startWindow, endWindow);

        for (Setting setting : settings) {
            try {
                sendStudyReminder(setting.getUserId(),
                        "Buổi sáng tốt lành! Hãy bắt đầu ngày mới với việc học từ vựng nhé.");
            } catch (Exception e) {
                log.error("Failed to send morning reminder to user {}: {}", setting.getUserId(), e.getMessage());
            }
        }

        if (!settings.isEmpty()) {
            log.info("Sent {} morning reminders", settings.size());
        }
    }

    /**
     * Run every minute to check for users who need evening reminders
     */
    @Override
    @Scheduled(cron = "0 * * * * *") // Every minute
    @Transactional
    public void sendEveningReminders() {
        LocalTime now = LocalTime.now();
        LocalTime startWindow = now.minusMinutes(1);
        LocalTime endWindow = now.plusMinutes(1);

        List<Setting> settings = settingRepository.findUsersForEveningReminder(startWindow, endWindow);

        for (Setting setting : settings) {
            try {
                sendStudyReminder(setting.getUserId(), "Đừng quên ôn lại từ vựng hôm nay nhé!");
            } catch (Exception e) {
                log.error("Failed to send evening reminder to user {}: {}", setting.getUserId(), e.getMessage());
            }
        }

        if (!settings.isEmpty()) {
            log.info("Sent {} evening reminders", settings.size());
        }
    }

    /**
     * Run at 8 PM daily to remind users who haven't studied today about maintaining
     * their streak
     * Only sends to users who have NO FlashcardReview AND NO UserLessonProgress
     * today
     */
    @Override
    @Scheduled(cron = "0 0 20 * * *") // 8 PM daily
    @Transactional
    public void sendStreakReminders() {
        List<Setting> settings = settingRepository.findByStreakReminderEnabledTrue();
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);

        int sentCount = 0;
        for (Setting setting : settings) {
            try {
                User user = userRepository.findById(setting.getUserId()).orElse(null);
                if (user == null)
                    continue;

                // Check if user has any activity today
                boolean hasFlashcardReviewToday = hasFlashcardReviewToday(user.getId(), startOfDay);
                boolean hasLessonProgressToday = hasLessonProgressToday(user.getId(), startOfDay);

                // Only send reminder if user hasn't done anything today
                if (!hasFlashcardReviewToday && !hasLessonProgressToday) {
                    // Calculate streak days
                    int streakDays = calculateStreakDays(user.getId());
                    sendStreakReminderToUser(user, streakDays);
                    sentCount++;
                }
            } catch (Exception e) {
                log.error("Failed to send streak reminder to user {}: {}", setting.getUserId(), e.getMessage());
            }
        }

        if (sentCount > 0) {
            log.info("Sent {} streak reminders at 8PM", sentCount);
        }
    }

    /**
     * Check scheduled flashcard review notifications and send them when due
     * Runs every minute to check for notifications with scheduledTime <= now
     */
    @Override
    @Scheduled(cron = "0 * * * * *") // Every minute
    @Transactional
    public void sendScheduledFlashcardReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<Notification> pendingNotifications = notificationRepository.findPendingScheduledNotifications(now);

        for (Notification notification : pendingNotifications) {
            try {
                // Mark as sent (set scheduledTime to null or add a 'sent' flag)
                notification.setScheduledTime(null);
                notificationRepository.save(notification);

                // Send via WebSocket
                Map<String, String> data = new HashMap<>();
                data.put("type", notification.getType());
                data.put("notificationId", notification.getId().toString());
                notificationService.sendToUser(
                        notification.getUser().getId(),
                        notification.getTitle(),
                        notification.getMessage(),
                        data);

                log.info("Sent scheduled flashcard reminder to user {}", notification.getUser().getId());
            } catch (Exception e) {
                log.error("Failed to send scheduled notification {}: {}", notification.getId(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void scheduleFlashcardReviewNotification(Long userId, Long wordId, String wordName,
            LocalDateTime reviewTime) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User {} not found for flashcard review notification", userId);
            return;
        }

        // Check if user has study reminders enabled
        Setting setting = settingRepository.findByUserId(userId).orElse(null);
        if (setting != null && !setting.getStudyReminderEnabled()) {
            log.debug("Study reminder disabled for user {}, skipping notification", userId);
            return;
        }

        String message = String.format("Đừng quên ôn lại từ \"%s\" hôm nay nhé.", wordName);

        Notification notification = Notification.builder()
                .type(NotificationType.STUDY_REMINDER.name())
                .title("Nhắc nhở học tập")
                .message(message)
                .user(user)
                .isRead(false)
                .scheduledTime(reviewTime)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
        log.info("Scheduled flashcard review notification for user {} word {} at {}", userId, wordName, reviewTime);
    }

    // Helper methods

    private boolean hasFlashcardReviewToday(Long userId, LocalDateTime startOfDay) {
        long count = flashcardReviewRepository.countDistinctWordsReviewedToday(userId, startOfDay);
        return count > 0;
    }

    private boolean hasLessonProgressToday(Long userId, LocalDateTime startOfDay) {
        // Check if user has any lesson progress updated today
        // This requires a query in UserLessonProgressRepository
        return userLessonProgressRepository.existsByUserIdAndUpdatedAtAfter(userId, startOfDay);
    }

    private int calculateStreakDays(Long userId) {
        List<Object> reviewDates = flashcardReviewRepository.findReviewDatesByUserId(userId);
        if (reviewDates.isEmpty())
            return 0;

        int streak = 0;
        LocalDate today = LocalDate.now();
        LocalDate lastDate = convertToLocalDate(reviewDates.get(0));

        if (!lastDate.equals(today) && !lastDate.equals(today.minusDays(1))) {
            return 0;
        }

        LocalDate current = lastDate;
        for (Object dateObj : reviewDates) {
            LocalDate d = convertToLocalDate(dateObj);
            if (d.equals(current)) {
                streak++;
                current = current.minusDays(1);
            } else if (d.isAfter(current)) {
                continue;
            } else {
                break;
            }
        }
        return streak;
    }

    private LocalDate convertToLocalDate(Object dateObj) {
        if (dateObj instanceof java.sql.Date) {
            return ((java.sql.Date) dateObj).toLocalDate();
        } else if (dateObj instanceof java.time.LocalDate) {
            return (java.time.LocalDate) dateObj;
        } else if (dateObj instanceof java.util.Date) {
            return new java.sql.Date(((java.util.Date) dateObj).getTime()).toLocalDate();
        }
        throw new IllegalArgumentException("Unsupported date type: " + dateObj.getClass().getName());
    }

    @Override
    @Transactional
    public void sendAchievementNotification(Long userId, String achievementType, String message) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User {} not found for achievement notification", userId);
            return;
        }

        Notification notification = Notification.builder()
                .type(NotificationType.ACHIEVEMENT.name())
                .title("Hoàn thành mục tiêu")
                .message(message)
                .user(user)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        // Send via WebSocket
        Map<String, String> data = new HashMap<>();
        data.put("type", NotificationType.ACHIEVEMENT.name());
        data.put("achievementType", achievementType);
        notificationService.sendToUser(userId, notification.getTitle(), message, data);

        log.info("Sent achievement notification to user {}: {}", userId, achievementType);
    }

    @Override
    @Transactional
    public void sendNewVocabularyNotification(Long userId, String setName) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User {} not found for new vocabulary notification", userId);
            return;
        }

        String message = String.format("Bộ từ vựng \"%s\" vừa được cập nhật. Khám phá ngay!", setName);

        Notification notification = Notification.builder()
                .type(NotificationType.NEW_VOCABULARY.name())
                .title("Bộ từ vựng mới!")
                .message(message)
                .user(user)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        // Send via WebSocket
        Map<String, String> data = new HashMap<>();
        data.put("type", NotificationType.NEW_VOCABULARY.name());
        data.put("setName", setName);
        notificationService.sendToUser(userId, notification.getTitle(), message, data);

        log.info("Sent new vocabulary notification to user {}: {}", userId, setName);
    }

    // Helper methods

    private void sendStudyReminder(Long userId, String message) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return;

        Notification notification = Notification.builder()
                .type(NotificationType.STUDY_REMINDER.name())
                .title("Nhắc nhở học tập")
                .message(message)
                .user(user)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        // Send via WebSocket
        Map<String, String> data = new HashMap<>();
        data.put("type", NotificationType.STUDY_REMINDER.name());
        notificationService.sendToUser(userId, notification.getTitle(), message, data);
    }

    private void sendStreakReminderToUser(User user, int streakDays) {
        String message;
        if (streakDays > 0) {
            message = String.format("Chỉ còn vài giờ nữa để giữ vững chuỗi %d ngày học của bạn. Học ngay nào!",
                    streakDays);
        } else {
            message = "Hôm nay bạn chưa học gì cả. Hãy bắt đầu ngay để xây dựng chuỗi học tập nhé!";
        }

        Notification notification = Notification.builder()
                .type(NotificationType.STREAK_REMINDER.name())
                .title("Duy trì chuỗi học tập!")
                .message(message)
                .user(user)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        // Send via WebSocket
        Map<String, String> data = new HashMap<>();
        data.put("type", NotificationType.STREAK_REMINDER.name());
        data.put("streakDays", String.valueOf(streakDays));
        notificationService.sendToUser(user.getId(), notification.getTitle(), message, data);
    }
}
