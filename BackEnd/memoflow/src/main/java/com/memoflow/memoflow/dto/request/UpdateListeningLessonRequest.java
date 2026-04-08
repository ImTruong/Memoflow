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
public class UpdateListeningLessonRequest {
    private Long id;
    private String title;
    private Integer part;
    private List<UpdateListeningGroupRequest> groups;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateListeningGroupRequest {
        private Long id;
        private Integer orderIndex;
        private String type;
        private String transcript;
        private String translation;
        private Boolean hasAudio;
        private Boolean deleteAudio;
        private Boolean hasImage;
        private Boolean deleteImage;
        private List<UpdateListeningQuizRequest> quizzes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateListeningQuizRequest {
        private Long id;
        private String questionText;
        private String translation;
        private Integer orderIndex;
        private List<UpdateListeningOptionRequest> options;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateListeningOptionRequest {
        private Long id;
        private Integer orderIndex;
        private String type;
        private String optionText;
        private Boolean isCorrect;
    }
}
