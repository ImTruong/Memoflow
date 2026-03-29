package com.memoflow.memoflow.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SubmitListeningLessonRequest {
    private Long lessonId;
    private Long userId;
    private List<Answer> answers;

    @Data
    public static class Answer {
        private Long quizId;
        private Long optionId;
    }
}