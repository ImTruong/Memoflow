package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryLessonResponse {
    private Long id;
    private String title;
    private String type;
    private String description;
    private Media image;
    private Map<String, Object> content;
    private Long learningActivityId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Media {
        private String url;
    }
}
