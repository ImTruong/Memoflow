package com.memoflow.memoflow.util;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class SM2Calculator {

    public static final double DEFAULT_EASE_FACTOR = 2.5;

    public SM2Result calculate(int quality, int previousRepetitions, double previousEaseFactor, int previousInterval) {
        int newRepetitions;
        int newInterval;
        double newEaseFactor;

        quality = Math.max(0, Math.min(5, quality));

        if (quality >= 3) {
            if (previousRepetitions == 0) {
                newInterval = 1;
            } else if (previousRepetitions == 1) {
                newInterval = 6;
            } else {
                newInterval = (int) Math.round(previousInterval * previousEaseFactor);
            }
            newRepetitions = previousRepetitions + 1;
        } else {
            newRepetitions = 0;
            newInterval = 1;
        }

        newEaseFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEaseFactor < 1.3) {
            newEaseFactor = 1.3;
        }

        LocalDateTime nextReviewDate = LocalDateTime.now().plusDays(newInterval);

        return SM2Result.builder()
                .repetition(newRepetitions)
                .easeFactor(newEaseFactor)
                .intervalDays(newInterval)
                .nextReviewDate(nextReviewDate)
                .build();
    }
}
