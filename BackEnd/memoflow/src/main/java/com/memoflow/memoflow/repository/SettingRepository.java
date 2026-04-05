package com.memoflow.memoflow.repository;

import com.memoflow.memoflow.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SettingRepository extends JpaRepository<Setting, Long> {

        /**
         * Find setting by user ID
         */
        Optional<Setting> findByUserId(Long userId);

        /**
         * Find settings where study reminder is enabled and time window is active
         * for users who should receive morning reminders
         */
        @Query("SELECT s FROM Setting s WHERE s.studyReminderEnabled = true " +
                        "AND s.timeWindow = true " +
                        "AND s.morningReminderTime BETWEEN :startTime AND :endTime")
        List<Setting> findUsersForMorningReminder(
                        @Param("startTime") LocalTime startTime,
                        @Param("endTime") LocalTime endTime);

        /**
         * Find settings where study reminder is enabled and time window is active
         * for users who should receive evening reminders
         */
        @Query("SELECT s FROM Setting s WHERE s.studyReminderEnabled = true " +
                        "AND s.timeWindow = true " +
                        "AND s.eveningReminderTime BETWEEN :startTime AND :endTime")
        List<Setting> findUsersForEveningReminder(
                        @Param("startTime") LocalTime startTime,
                        @Param("endTime") LocalTime endTime);

        /**
         * Find settings where streak reminder is enabled
         */
        List<Setting> findByStreakReminderEnabledTrue();

        /**
         * Find settings where study reminder is enabled
         */
        List<Setting> findByStudyReminderEnabledTrue();
}
