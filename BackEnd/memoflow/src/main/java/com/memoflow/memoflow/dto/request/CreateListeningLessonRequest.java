package com.memoflow.memoflow.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateListeningLessonRequest {
    private String title;
    private Integer part;
    private List<ListeningGroupRequest> groups;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListeningGroupRequest {
        private Integer orderIndex;
        private String type;
        private String transcript;
        private String translation;
        private List<ListeningQuizRequest> quizzes;
        private Boolean hasAudio;
        private Boolean hasImage;

    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListeningQuizRequest {
        private String questionText;
        private String translation;
        private Integer orderIndex;
        private List<ListeningOptionRequest> options;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListeningOptionRequest {
        private Integer orderIndex;
        private String type;
        private String optionText;
        private Boolean isCorrect;
    }
}