package com.memoflow.memoflow.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DailyStudyStatsResponse {
    private long reviewedTodayCount;
    private long dueTodayCount;
    private long totalReviewsCount;
    private int streakDays;
}
