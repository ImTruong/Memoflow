package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpsertWordRaceLessonRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Target score is required")
    @Min(value = 1, message = "Target score must be at least 1")
    private Integer targetScore;

    @NotNull(message = "Time limit is required")
    @Min(value = 3, message = "Time limit must be at least 3 seconds")
    private Integer timeLimit;

    private List<@NotBlank(message = "Forbidden ending must not be blank") String> forbiddenEndings;
}
