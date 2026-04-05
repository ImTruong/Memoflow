package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarPracticeDetailResponse {
    private Long practiceId;
    private String title;
    private String lessonTitle;
    private Integer overallProgress;
    private Integer totalQuestions;
    private String difficulty;
    private Integer durationMinutes;
    private List<GrammarPracticeTaskResponse> tasks;
}
