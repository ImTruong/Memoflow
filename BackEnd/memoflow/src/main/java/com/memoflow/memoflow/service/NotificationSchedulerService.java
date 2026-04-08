package com.memoflow.memoflow.service;

import java.time.LocalDateTime;

/**
 * Service for scheduling and sending automated notifications
 * based on user settings (study reminders, streak reminders)
 */
public interface NotificationSchedulerService {

    /**
     * Check and send morning study reminders to users with timeWindow enabled
     * Called by scheduled task at configured morning time
     */
    void sendMorningReminders();

    /**
     * Check and send evening study reminders to users with timeWindow enabled
     * Called by scheduled task at configured evening time
     */
    void sendEveningReminders();

    /**
     * Check and send streak reminder notifications to users who haven't studied
     * today and have streakReminderEnabled. Runs at 8 PM daily.
     */
    void sendStreakReminders();

    /**
     * Check and send scheduled flashcard review notifications when due.
     * Runs every minute.
     */
    void sendScheduledFlashcardReminders();

    /**
     * Schedule a notification for a specific flashcard review time
     * Called when a new FlashcardReview is created
     */
    void scheduleFlashcardReviewNotification(Long userId, Long wordId, String wordName, LocalDateTime reviewTime);

    /**
     * Send notification when user completes a learning goal
     */
    void sendAchievementNotification(Long userId, String achievementType, String message);

    /**
     * Send notification when new vocabulary set is available
     */
    void sendNewVocabularyNotification(Long userId, String setName);
}
