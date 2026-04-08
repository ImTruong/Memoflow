package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpsertWordHuntLessonRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category key is required")
    private String categoryKey;

    @NotBlank(message = "Category label is required")
    private String categoryLabel;

    @Min(value = 6, message = "Board size must be at least 6")
    @Max(value = 20, message = "Board size must be at most 20")
    @NotNull(message = "Board size is required")
    private Integer boardSize;

    @Min(value = 30, message = "Time limit must be at least 30 seconds")
    @NotNull(message = "Time limit is required")
    private Integer timeLimitSeconds;

    @Min(value = 1, message = "Target word count must be at least 1")
    @NotNull(message = "Target word count is required")
    private Integer targetWordCount;

    @Min(value = 0, message = "Max hints per day must be non-negative")
    @NotNull(message = "Max hints per day is required")
    private Integer maxHintsPerDay;

    @NotBlank(message = "Objective text is required")
    private String objectiveText;

    private String unlockRequirementText;

    @NotEmpty(message = "Words are required")
    private List<@NotBlank(message = "Word must not be blank") String> words;
}
