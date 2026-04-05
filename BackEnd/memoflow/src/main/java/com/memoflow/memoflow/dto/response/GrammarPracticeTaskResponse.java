package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarPracticeTaskResponse {
    private Long id;
    private String title;
    private String status;
    private String type;
    private String score;
    private String count;
    private Integer totalQuestions;
    private String difficulty;
    private Integer durationMinutes;
}
