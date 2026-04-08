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
public class FlashcardLessonSummaryResponse {
    private Long id;
    private String title;
    private String type;
    private String description;
    private String imageUrl;
    private Map<String, Object> content;
    private Long learningActivityId;
    private Long creatorId;
    private String creatorName;
    private long totalWords;
    private long learnedWords;
    private long totalDueWord;
}
