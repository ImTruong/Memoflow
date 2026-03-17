package com.memoflow.memoflow.util;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SM2Result {
    private int repetition;
    private double easeFactor;
    private int intervalDays;
    private LocalDateTime nextReviewDate;
}
