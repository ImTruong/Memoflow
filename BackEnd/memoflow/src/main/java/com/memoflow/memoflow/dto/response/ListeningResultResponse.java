package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ListeningResultResponse {
    private Long lessonId;
    private String title;
    private String type;
    private int totalQuestion;
    private int score;
    private List<GroupResult> groups;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class GroupResult {
        private Long groupId;
        private Media audio;
        private Media images;
        private String transcript;
        private String translation;
        private List<QuizResult> quizzes;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Media {
        private String url;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class QuizResult {
        private Long quizId;
        private String questionText;
        private String translation;
        private Integer userAnswer; // optionId mà user chọn
        private List<OptionResult> options;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OptionResult {
        private Integer optionId;
        private String optionText;
        private boolean isCorrect;
    }
}