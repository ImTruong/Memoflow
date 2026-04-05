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
public class GrammarPracticeResultResponse {
    private Long practiceId;
    private String title;
    private Integer totalQuestions;
    private Integer score;
    private List<QuestionResult> questions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionResult {
        private Long quizId;
        private String questionText;
        private String type;
        private String explanation;
        private Long userOptionId;
        private String userTextAnswer;
        private Long correctOptionId;
        private String correctTextAnswer;
        private boolean correct;
        private List<OptionResult> options;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OptionResult {
        private Long optionId;
        private String optionText;
        private boolean isCorrect;
    }
}
