package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFlashcardReviewRequest {
    
    @NotBlank(message = "Difficulty is required")
    private String difficulty;

}
