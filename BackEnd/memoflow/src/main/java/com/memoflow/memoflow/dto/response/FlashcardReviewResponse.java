package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardReviewResponse {
    private Long id;
    private String difficulty;
    private Integer repetition;
    private Double easeFactor;
    private Integer intervalDays;
    private LocalDateTime nextReviewDate;
    private LocalDateTime createdAt;
    private Long wordId;
    private String wordName;
    private String wordDefinition;
    private String wordIPA;
    private Long userId;
}
