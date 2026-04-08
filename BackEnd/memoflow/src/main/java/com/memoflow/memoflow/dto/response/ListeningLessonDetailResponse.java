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
public class ListeningLessonDetailResponse {
    private Long lessonId;
    private String title;
    private String type;
    private List<GroupResponse> groups;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class GroupResponse {
        private Long groupId;
        private MediaResponse audio;
        private MediaResponse images;
        private List<QuizResponse> quizzes;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class QuizResponse {
        private Long quizId;
        private String questionText;
        private List<OptionResponse> options;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OptionResponse {
        private Long optionId;
        private String optionText;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class MediaResponse {
        private String url;
    }
}