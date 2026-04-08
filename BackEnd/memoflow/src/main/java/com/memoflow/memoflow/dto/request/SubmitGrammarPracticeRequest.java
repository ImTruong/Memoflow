package com.memoflow.memoflow.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SubmitGrammarPracticeRequest {
    private List<Answer> answers;

    @Data
    public static class Answer {
        private Long quizId;
        private Long optionId;
        private String textAnswer;
    }
}
