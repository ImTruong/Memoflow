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
// DTO nhan du lieu cap nhat truyen chem tu admin.
public class UpdateStoryLearningLessonRequest {

    // Tieu de truyen chem hien thi cho user.
    @NotBlank(message = "Title is required")
    private String title;

    // Mo ta ngan cua truyen chem.
    private String description;

    // Tieu de tieng Anh, co the de trong de xoa khoi content.
    private String englishTitle;

    // Danh sach doan van moi cua truyen chem.
    @NotEmpty(message = "Paragraphs are required")
    private List<@NotBlank(message = "Paragraph must not be blank") String> paragraphs;

    // Danh sach tu vung moi cua truyen chem.
    @Valid
    private List<StoryVocabularyRequest> vocabulary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    // DTO con cho tung tu vung cua truyen chem.
    public static class StoryVocabularyRequest {
        // Tu tieng Anh can hoc.
        @NotBlank(message = "Word is required")
        private String word;
    }
}
