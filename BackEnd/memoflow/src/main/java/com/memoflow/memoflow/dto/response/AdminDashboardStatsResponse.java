package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStatsResponse {
    private long totalUsers;
    private long totalFlashcardSets;
    private long totalWords;
    private long totalStoryLessons;
    private long totalListeningLessons;
    private long totalBilingualLessons;
}
