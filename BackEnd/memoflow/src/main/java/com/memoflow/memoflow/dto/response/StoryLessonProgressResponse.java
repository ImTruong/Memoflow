package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryLessonProgressResponse {
    private Long id;
    private Boolean isCompleted;
    private Double progressPercent;
    private Integer score;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private StoryLessonResponse learningLesson;
}
