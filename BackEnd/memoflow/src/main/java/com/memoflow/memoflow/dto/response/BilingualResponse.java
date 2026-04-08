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
public class BilingualResponse {
    private Long id;
    private String title;
    private String description;
    private Map<String, Object> content;
    private Media media;
    private Boolean isRead;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Media {
        private String url;
    }
}