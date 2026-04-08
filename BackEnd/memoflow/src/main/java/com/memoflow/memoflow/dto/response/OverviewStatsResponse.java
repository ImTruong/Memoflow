package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OverviewStatsResponse {
    private long vocabularyCount;
    private long grammarCount;
    private long listeningCount;
    private long totalActivities;
    private String todayDate;
    private java.util.List<Long> weeklyActivity;
}
