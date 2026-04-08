package com.memoflow.memoflow.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ListeningLessonSubmissionResponse {

    private Long lessonId;
    private List<Answer> answers;

    @Data
    public static class Answer {
        private Long quizId;
        private Long optionId;
    }
}
