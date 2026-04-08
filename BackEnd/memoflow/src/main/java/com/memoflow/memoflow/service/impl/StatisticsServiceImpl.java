package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.response.*;
import com.memoflow.memoflow.entity.LearningLesson;
import com.memoflow.memoflow.entity.UserLessonProgress;
import com.memoflow.memoflow.repository.FlashcardReviewRepository;
import com.memoflow.memoflow.repository.UserLessonProgressRepository;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

        private final com.memoflow.memoflow.repository.LearningLessonRepository learningLessonRepository;
        private final com.memoflow.memoflow.repository.UserRepository userRepository;
        private final com.memoflow.memoflow.repository.WordRepository wordRepository;
        private final FlashcardReviewRepository flashcardReviewRepository;
        private final UserLessonProgressRepository userLessonProgressRepository;

        @Override
        public OverviewStatsResponse getOverviewStats(UserPrincipal userPrincipal) {
                LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
                Long userId = userPrincipal.getId();

                long vocabularyCount = flashcardReviewRepository.countDistinctLessonsReviewedToday(userId, startOfDay);
                long grammarCount = userLessonProgressRepository.countCompletedLessonsByTypeToday(userId, startOfDay,
                                "GRAMMAR_%");
                long listeningCount = userLessonProgressRepository.countCompletedLessonsByTypeToday(userId, startOfDay,
                                "LISTENING_%");

                long totalActivities = vocabularyCount + grammarCount + listeningCount;

                return OverviewStatsResponse.builder()
                                .vocabularyCount(vocabularyCount)
                                .grammarCount(grammarCount)
                                .listeningCount(listeningCount)
                                .totalActivities(totalActivities)
                                .todayDate(formatTodayDate())
                                .build();
        }

        private String formatTodayDate() {
                LocalDateTime now = LocalDateTime.now();
                DayOfWeek day = now.getDayOfWeek();
                String dayOfWeekStr = switch (day) {
                        case MONDAY -> "Thứ 2";
                        case TUESDAY -> "Thứ 3";
                        case WEDNESDAY -> "Thứ 4";
                        case THURSDAY -> "Thứ 5";
                        case FRIDAY -> "Thứ 6";
                        case SATURDAY -> "Thứ 7";
                        case SUNDAY -> "Chủ Nhật";
                };

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
                return dayOfWeekStr + ", " + now.format(formatter);
        }

        @Override
        public ListeningStatsOverviewResponse getListeningOverviewStats(UserPrincipal userPrincipal) {
                Long userId = userPrincipal.getId();
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime startOfWeek = now.minusDays(now.getDayOfWeek().getValue() - 1).with(LocalTime.MIN);

                long totalExams = userLessonProgressRepository.countCompletedLessonsByTypeToday(userId,
                                LocalDateTime.of(2000, 1, 1, 0, 0), "LISTENING_%");
                long newExamsThisWeek = userLessonProgressRepository.countCompletedLessonsByTypeToday(userId,
                                startOfWeek,
                                "LISTENING_%");

                String[] partNames = {
                                "Part 1: Mô tả hình ảnh",
                                "Part 2: Hỏi & Đáp",
                                "Part 3: Đoạn hội thoại",
                                "Part 4: Bài nói ngắn"
                };
                String[] partColors = { "#818CF8", "#34D399", "#FBBF24", "#F472B6" };
                String[] partIcons = { "image-outline", "chatbubble-outline", "people-outline", "megaphone-outline" };

                List<ListeningStatsOverviewResponse.PartStats> partStatsList = new ArrayList<>();
                for (int i = 1; i <= 4; i++) {
                        String typePattern = "LISTENING_PART_" + i;
                        long completedCount = userLessonProgressRepository.countCompletedLessonsByTypeToday(userId,
                                        LocalDateTime.of(2000, 1, 1, 0, 0), typePattern);

                        // Get recent exams (titles)
                        org.springframework.data.domain.Pageable top3 = org.springframework.data.domain.PageRequest
                                        .of(0, 3);
                        org.springframework.data.domain.Page<com.memoflow.memoflow.dto.response.ListeningLessonResponse> recentP = learningLessonRepository
                                        .findListeningLessons(userId, typePattern, "completed", top3);
                        List<String> recentExams = recentP.getContent().stream()
                                        .map(com.memoflow.memoflow.dto.response.ListeningLessonResponse::getTitle)
                                        .collect(Collectors.toList());
                        long totalPartCount = recentP.getTotalElements();
                        long moreCount = Math.max(0, totalPartCount - recentExams.size());

                        String percentage = totalExams == 0 ? "0%"
                                        : (int) ((completedCount * 100.0) / totalExams) + "%";

                        partStatsList.add(ListeningStatsOverviewResponse.PartStats.builder()
                                        .name(partNames[i - 1])
                                        .partNumber(i)
                                        .percentage(percentage)
                                        .completedCount(completedCount)
                                        .recentExams(recentExams)
                                        .moreCount(moreCount)
                                        .color(partColors[i - 1])
                                        .iconName(partIcons[i - 1])
                                        .build());
                }

                return ListeningStatsOverviewResponse.builder()
                                .totalExams(totalExams)
                                .newExamsThisWeek(newExamsThisWeek)
                                .parts(partStatsList)
                                .build();
        }

        @Override
        public GrammarStatsOverviewResponse getGrammarOverviewStats(UserPrincipal userPrincipal) {
                Long userId = userPrincipal.getId();
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime startOfWeek = now.minusDays(now.getDayOfWeek().getValue() - 1).with(LocalTime.MIN);

                long totalLessons = userLessonProgressRepository.countCompletedLessonsByTypeToday(userId,
                                LocalDateTime.of(2000, 1, 1, 0, 0), "GRAMMAR_PRACTICE");
                long newLessonsThisWeek = userLessonProgressRepository.countCompletedLessonsByTypeToday(userId,
                                startOfWeek,
                                "GRAMMAR_PRACTICE");

                List<LearningLesson> grammarLessons = learningLessonRepository.findByTypeOrderByIdAsc("GRAMMAR_LESSON");
                List<LearningLesson> allPractices = learningLessonRepository.findByTypeOrderByIdAsc("GRAMMAR_PRACTICE");

                Map<Long, List<LearningLesson>> practicesByLessonId = new HashMap<>();
                Map<String, Long> lessonIdByTitle = new HashMap<>();
                for (LearningLesson lesson : grammarLessons) {
                        lessonIdByTitle.put(lesson.getTitle(), lesson.getId());
                }

                for (LearningLesson practice : allPractices) {
                        Map<String, Object> content = practice.getContent();
                        Long grammarLessonId = null;
                        if (content != null) {
                                Object idObj = content.get("grammarLessonId");
                                if (idObj instanceof Number)
                                        grammarLessonId = ((Number) idObj).longValue();
                                else if (idObj instanceof String) {
                                        try {
                                                grammarLessonId = Long.parseLong((String) idObj);
                                        } catch (Exception e) {
                                        }
                                }

                                if (grammarLessonId == null) {
                                        Object titleObj = content.get("grammarLessonTitle");
                                        if (titleObj != null)
                                                grammarLessonId = lessonIdByTitle.get(titleObj.toString());
                                }
                        }
                        if (grammarLessonId != null) {
                                practicesByLessonId.computeIfAbsent(grammarLessonId, k -> new ArrayList<>())
                                                .add(practice);
                        }
                }

                String[] colors = { "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F43F5E" };
                String[] icons = { "book-open-variant", "pencil-outline", "school-outline", "library-outline",
                                "bookmark-outline" };

                List<GrammarStatsOverviewResponse.CategoryStats> categoryStats = new ArrayList<>();
                int i = 0;
                for (LearningLesson lesson : grammarLessons) {
                        List<LearningLesson> practices = practicesByLessonId.getOrDefault(lesson.getId(),
                                        Collections.emptyList());
                        if (practices.isEmpty())
                                continue;

                        long completedCount = 0;
                        List<GrammarStatsOverviewResponse.RecentLesson> finishedExams = new ArrayList<>();
                        for (LearningLesson p : practices) {
                                if (userLessonProgressRepository.existsByUserIdAndLearningLessonIdAndIsCompletedTrue(
                                                userId,
                                                p.getId())) {
                                        completedCount++;
                                        if (finishedExams.size() < 3) {
                                                finishedExams.add(GrammarStatsOverviewResponse.RecentLesson.builder()
                                                                .id(p.getId())
                                                                .title(p.getTitle())
                                                                .build());
                                        }
                                }
                        }

                        String percentage = totalLessons == 0 ? "0%"
                                        : (int) ((completedCount * 100.0) / totalLessons) + "%";

                        categoryStats.add(GrammarStatsOverviewResponse.CategoryStats.builder()
                                        .name("Bài tập " + lesson.getTitle())
                                        .categoryId(lesson.getId())
                                        .percentage(percentage)
                                        .completedCount(completedCount)
                                        .recentLessons(finishedExams)
                                        .moreCount(Math.max(0, completedCount - finishedExams.size()))
                                        .color(colors[i % colors.length])
                                        .iconName(icons[i % icons.length])
                                        .build());
                        i++;
                }

                return GrammarStatsOverviewResponse.builder()
                                .totalLessons(totalLessons)
                                .newLessonsThisWeek(newLessonsThisWeek)
                                .categories(categoryStats)
                                .build();
        }

        @Override
        public VocabularyStatsOverviewResponse getVocabularyOverviewStats(UserPrincipal userPrincipal) {
                Long userId = userPrincipal.getId();
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime startOfWeek = now.minusDays(now.getDayOfWeek().getValue() - 1).with(LocalTime.MIN);

                long totalSetsLearned = userLessonProgressRepository.countCompletedLessonsByTypeToday(userId,
                                LocalDateTime.of(2000, 1, 1, 0, 0), "FLASHCARD");
                long newWordsThisWeek = flashcardReviewRepository.countDistinctWordsReviewedToday(userId, startOfWeek);

                // Group by Categories (using PrivacyMode as simple categories for now, or
                // extracted from content)
                // Actually, let's group by "Của tôi" and "Cộng đồng" as indicated by the user's
                // flow

                List<VocabularyStatsOverviewResponse.CategoryStats> categories = new ArrayList<>();

                // Category 1: Mine
                List<UserLessonProgress> mineProgress = userLessonProgressRepository
                                .findCompletedLessonsByUserIdAndType(userId,
                                                "FLASHCARD");
                List<UserLessonProgress> mySets = mineProgress.stream()
                                .filter(p -> p.getLearningLesson().getCreator() != null
                                                && p.getLearningLesson().getCreator().getId().equals(userId))
                                .collect(Collectors.toList());

                categories.add(VocabularyStatsOverviewResponse.CategoryStats.builder()
                                .categoryId(-1L)
                                .name("Bộ từ vựng của tôi")
                                .completedCount(mySets.size())
                                .percentage(totalSetsLearned == 0 ? "0%"
                                                : (int) ((mySets.size() * 100.0) / totalSetsLearned) + "%")
                                .recentSets(mySets.stream().limit(3)
                                                .map(p -> VocabularyStatsOverviewResponse.RecentSet.builder()
                                                                .id(p.getLearningLesson().getId())
                                                                .title(p.getLearningLesson().getTitle())
                                                                .build())
                                                .collect(Collectors.toList()))
                                .moreCount(Math.max(0, mySets.size() - 3))
                                .color("#3B82F6")
                                .iconName("account-outline")
                                .build());

                // Category 2: Community
                List<UserLessonProgress> communitySets = mineProgress.stream()
                                .filter(p -> p.getLearningLesson().getCreator() == null
                                                || !p.getLearningLesson().getCreator().getId().equals(userId))
                                .collect(Collectors.toList());

                categories.add(VocabularyStatsOverviewResponse.CategoryStats.builder()
                                .categoryId(-2L)
                                .name("Bộ từ vựng cộng đồng")
                                .completedCount(communitySets.size())
                                .percentage(
                                                totalSetsLearned == 0 ? "0%"
                                                                : (int) ((communitySets.size() * 100.0)
                                                                                / totalSetsLearned) + "%")
                                .recentSets(communitySets.stream().limit(3)
                                                .map(p -> VocabularyStatsOverviewResponse.RecentSet.builder()
                                                                .id(p.getLearningLesson().getId())
                                                                .title(p.getLearningLesson().getTitle())
                                                                .build())
                                                .collect(Collectors.toList()))
                                .moreCount(Math.max(0, communitySets.size() - 3))
                                .color("#10B981")
                                .iconName("earth-outline")
                                .build());

                return VocabularyStatsOverviewResponse.builder()
                                .totalSetsLearned(totalSetsLearned)
                                .newWordsThisWeek(newWordsThisWeek)
                                .categories(categories)
                                .build();
        }

        @Override
        public java.util.List<VocabularyStatsOverviewResponse.RecentSet> getVocabularySetsByCategory(
                        UserPrincipal userPrincipal, String category) {
                Long userId = userPrincipal.getId();
                List<UserLessonProgress> mineProgress = userLessonProgressRepository
                                .findCompletedLessonsByUserIdAndType(userId,
                                                "FLASHCARD");

                if (category.equals("Bộ từ vựng của tôi") || category.equals("-1")) {
                        return mineProgress.stream()
                                        .filter(p -> p.getLearningLesson().getCreator() != null
                                                        && p.getLearningLesson().getCreator().getId().equals(userId))
                                        .map(p -> VocabularyStatsOverviewResponse.RecentSet.builder()
                                                        .id(p.getLearningLesson().getId())
                                                        .title(p.getLearningLesson().getTitle())
                                                        .build())
                                        .collect(Collectors.toList());
                } else {
                        return mineProgress.stream()
                                        .filter(p -> p.getLearningLesson().getCreator() == null
                                                        || !p.getLearningLesson().getCreator().getId().equals(userId))
                                        .map(p -> VocabularyStatsOverviewResponse.RecentSet.builder()
                                                        .id(p.getLearningLesson().getId())
                                                        .title(p.getLearningLesson().getTitle())
                                                        .build())
                                        .collect(Collectors.toList());
                }
        }

        @Override
        public AdminDashboardStatsResponse getAdminDashboardStats() {
                return AdminDashboardStatsResponse.builder()
                                .totalUsers(userRepository.count())
                                .totalFlashcardSets(learningLessonRepository.countByTypeAndDeletedFalse("FLASHCARD"))
                                .totalWords(wordRepository.countByDeletedFalse())
                                .totalStoryLessons(learningLessonRepository.countByTypeAndDeletedFalse("TRUYEN_CHEM"))
                                .totalListeningLessons(learningLessonRepository.countByTypeStartingWithAndDeletedFalse("LISTENING_%"))
                                .totalBilingualLessons(learningLessonRepository.countByTypeAndDeletedFalse("BILINGUAL"))
                                .build();
        }
}
