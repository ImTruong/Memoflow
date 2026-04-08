package com.memoflow.memoflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "user_lesson_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "learning_lesson_id" }) })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class UserLessonProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_lesson_id", nullable = false)
    private LearningLesson learningLesson;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "progress_percent")
    @Builder.Default
    private Double progressPercent = 0.0;

    @Column(name = "score")
    private Integer score; // Dùng cho game hoặc quiz nếu cần

    @Column(name = "hints_used_today")
    @Builder.Default
    private Integer hintsUsedToday = 0;

    @Column(name = "hints_used_date")
    private LocalDate hintsUsedDate;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
