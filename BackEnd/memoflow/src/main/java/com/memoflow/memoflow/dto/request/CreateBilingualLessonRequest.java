package com.memoflow.memoflow.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CreateBilingualLessonRequest {
    private String title;
    private String description;
    private Content content;

    @Data
    public static class Content {
        private List<Paragraph> paragraphs;
    }

    @Data
    public static class Paragraph {
        private int order;
        private String en;
        private String vi;
    }
}