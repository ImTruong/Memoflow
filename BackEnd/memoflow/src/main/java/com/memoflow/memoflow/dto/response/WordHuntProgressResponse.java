package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordHuntProgressResponse {
    private Long id;
    private Boolean isCompleted;
    private Double progressPercent;
    private Integer score;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Integer hintsUsedToday;
    private LocalDate hintsUsedDate;
    private WordHuntLessonResponse learningLesson;
}
