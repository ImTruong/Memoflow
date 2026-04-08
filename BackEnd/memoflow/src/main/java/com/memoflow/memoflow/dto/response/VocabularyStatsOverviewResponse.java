package com.memoflow.memoflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyStatsOverviewResponse {
    private long totalSetsLearned;
    private long newWordsThisWeek;
    private List<CategoryStats> categories;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStats {
        private Long categoryId;
        private String name;
        private String percentage;
        private long completedCount;
        private List<RecentSet> recentSets;
        private long moreCount;
        private String color;
        private String iconName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentSet {
        private Long id;
        private String title;
        private Integer wordCount;
    }
}
