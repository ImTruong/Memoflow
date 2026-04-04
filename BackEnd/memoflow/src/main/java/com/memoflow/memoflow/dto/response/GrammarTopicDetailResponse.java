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
public class GrammarTopicDetailResponse {
    private Long topicId;
    private String title;
    private String description;
    private String progressLabel;
    private Integer progressPercent;
    private List<SubLessonResponse> subLessons;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubLessonResponse {
        private Long id;
        private String title;
        private String subTitle;
        private String status;
    }
}
