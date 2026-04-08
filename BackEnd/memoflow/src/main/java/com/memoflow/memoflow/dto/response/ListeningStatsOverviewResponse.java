package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ListeningStatsOverviewResponse {
    private long totalExams;
    private long newExamsThisWeek;
    private List<PartStats> parts;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PartStats {
        private String name;
        private int partNumber;
        private String percentage;
        private long completedCount;
        private List<String> recentExams;
        private long moreCount;
        private String color;
        private String iconName;
    }
}
