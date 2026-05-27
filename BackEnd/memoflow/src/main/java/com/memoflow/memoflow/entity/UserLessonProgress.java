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
// Entity luu tien do hoc/choi cua tung user theo tung lesson.
public class UserLessonProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Khoa chinh cua ban ghi tien do.
    private Long id;

    // User so huu tien do nay.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Lesson ma user dang hoc hoac dang choi.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_lesson_id", nullable = false)
    private LearningLesson learningLesson;

    // Trang thai hoan thanh lesson.
    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    // Phan tram tien do cua lesson.
    @Column(name = "progress_percent")
    @Builder.Default
    private Double progressPercent = 0.0;

    // Diem so cho game hoac quiz.
    @Column(name = "score")
    private Integer score;

    // So luot goi y da dung trong ngay, dung cho Word Hunt.
    @Column(name = "hints_used_today")
    @Builder.Default
    private Integer hintsUsedToday = 0;

    // Ngay ghi nhan so luot goi y de reset theo ngay.
    @Column(name = "hints_used_date")
    private LocalDate hintsUsedDate;

    // Thoi diem tao ban ghi tien do.
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Thoi diem cap nhat gan nhat.
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Thoi diem user hoan thanh lesson.
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
