package com.memoflow.memoflow.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWordHuntProgressRequest {

    private Boolean isCompleted;

    @Min(value = 0, message = "Progress percent must be at least 0")
    @Max(value = 100, message = "Progress percent must be at most 100")
    private Double progressPercent;

    @Min(value = 0, message = "Score must be non-negative")
    private Integer score;

    @Min(value = 0, message = "Hints used today must be non-negative")
    private Integer hintsUsedToday;

    private LocalDate hintsUsedDate;
}
