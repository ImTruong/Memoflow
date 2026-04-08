package com.memoflow.memoflow.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class GrammarStatsOverviewResponse {
    private long totalLessons;
    private long newLessonsThisWeek;
    private List<CategoryStats> categories;

    @Data
    @Builder
    public static class CategoryStats {
        private String name;
        private Long categoryId;
        private String percentage;
        private long completedCount;
        private List<RecentLesson> recentLessons;
        private long moreCount;
        private String color;
        private String iconName;
    }

    @Data
    @Builder
    public static class RecentLesson {
        private Long id;
        private String title;
    }
}
