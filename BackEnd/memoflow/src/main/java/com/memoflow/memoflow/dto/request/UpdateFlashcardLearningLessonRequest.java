package com.memoflow.memoflow.dto.request;

import org.springframework.web.multipart.MultipartFile;
import com.memoflow.memoflow.annotation.ValidImage;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFlashcardLearningLessonRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Privacy mode is required")
    private String privacyMode;

    @ValidImage
    private MultipartFile image;
}
