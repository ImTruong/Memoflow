package com.memoflow.memoflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Setting {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "study_reminder_enabled", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean studyReminderEnabled;

    @Column(name = "streak_reminder_enabled", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean streakReminderEnabled;

    @Column(name = "time_window", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean timeWindow;

    @Column(name = "morning_reminder_time", nullable = true, columnDefinition = "TIME DEFAULT '08:00:00'")
    private LocalTime morningReminderTime;

    @Column(name = "evening_reminder_time", nullable = true, columnDefinition = "TIME DEFAULT '21:00:00'")
    private LocalTime eveningReminderTime;
}
