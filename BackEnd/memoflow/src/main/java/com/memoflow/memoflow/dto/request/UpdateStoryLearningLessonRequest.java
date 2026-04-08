package com.memoflow.memoflow.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStoryLearningLessonRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String englishTitle;

    @NotEmpty(message = "Paragraphs are required")
    private List<@NotBlank(message = "Paragraph must not be blank") String> paragraphs;

    @Valid
    private List<StoryVocabularyRequest> vocabulary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoryVocabularyRequest {
        @NotBlank(message = "Word is required")
        private String word;
    }
}
