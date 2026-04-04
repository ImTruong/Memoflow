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
public class GrammarPracticeQuizResponse {
    private Long practiceId;
    private String title;
    private Integer totalQuestions;
    private List<QuestionResponse> questions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionResponse {
        private Long quizId;
        private String questionText;
        private String type;
        private String explanation;
        private List<OptionResponse> options;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OptionResponse {
        private Long optionId;
        private String optionText;
        private Integer orderIndex;
    }
}
