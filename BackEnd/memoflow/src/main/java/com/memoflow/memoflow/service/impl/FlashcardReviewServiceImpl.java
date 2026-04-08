package com.memoflow.memoflow.service.impl;

import com.memoflow.memoflow.dto.request.CreateFlashcardReviewRequest;
import com.memoflow.memoflow.dto.response.DailyStudyStatsResponse;
import com.memoflow.memoflow.dto.response.FlashcardReviewResponse;
import com.memoflow.memoflow.dto.response.HeatmapDataResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.entity.FlashcardReview;
import com.memoflow.memoflow.entity.User;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.repository.UserRepository;
import com.memoflow.memoflow.entity.Word;
import com.memoflow.memoflow.repository.FlashcardReviewRepository;
import com.memoflow.memoflow.repository.WordRepository;
import com.memoflow.memoflow.service.FlashcardReviewService;
import com.memoflow.memoflow.service.NotificationSchedulerService;
import com.memoflow.memoflow.util.SM2Calculator;
import com.memoflow.memoflow.util.SM2Result;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FlashcardReviewServiceImpl implements FlashcardReviewService {

    private final FlashcardReviewRepository flashcardReviewRepository;
    private final WordRepository wordRepository;
    private final UserRepository userRepository;
    private final SM2Calculator sm2Calculator;
    private final NotificationSchedulerService notificationSchedulerService;

    @Override
    public FlashcardReviewResponse save(Long wordId, CreateFlashcardReviewRequest createFlashcardReviewRequest,
            UserPrincipal userPrincipal) {

        Optional<FlashcardReview> optionalFlashcardReview = flashcardReviewRepository
                .findFirstByUserIdAndWordIdOrderByCreatedAtDesc(userPrincipal.getId(), wordId);

        int previousRepetitions = 0;
        double previousEaseFactor = SM2Calculator.DEFAULT_EASE_FACTOR;
        int previousInterval = 0;

        if (optionalFlashcardReview.isPresent()) {
            FlashcardReview lastReview = optionalFlashcardReview.get();
            previousRepetitions = lastReview.getRepetition() != null ? lastReview.getRepetition() : 0;
            previousEaseFactor = lastReview.getEaseFactor() != null ? lastReview.getEaseFactor()
                    : SM2Calculator.DEFAULT_EASE_FACTOR;
            previousInterval = lastReview.getIntervalDays() != null ? lastReview.getIntervalDays() : 0;
        }

        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("Word not found with id: " + wordId));

        FlashcardReview flashcardReview = new FlashcardReview();
        flashcardReview.setCreatedAt(LocalDateTime.now());
        User user = userRepository.getReferenceById(userPrincipal.getId());
        flashcardReview.setUser(user);
        flashcardReview.setWord(word);

        int quality = mapDifficultyToQuality(createFlashcardReviewRequest.getDifficulty());

        SM2Result sm2Result = sm2Calculator.calculate(quality, previousRepetitions, previousEaseFactor,
                previousInterval);

        flashcardReview.setDifficulty(createFlashcardReviewRequest.getDifficulty());
        flashcardReview.setRepetition(sm2Result.getRepetition());
        flashcardReview.setEaseFactor(sm2Result.getEaseFactor());
        flashcardReview.setIntervalDays(sm2Result.getIntervalDays());
        flashcardReview.setNextReviewDate(sm2Result.getNextReviewDate());

        FlashcardReview savedReview = flashcardReviewRepository.saveAndFlush(flashcardReview);

        // Schedule notification for next review time
        if (savedReview.getNextReviewDate() != null) {
            notificationSchedulerService.scheduleFlashcardReviewNotification(
                    userPrincipal.getId(),
                    word.getId(),
                    word.getName(),
                    savedReview.getNextReviewDate());
        }

        return FlashcardReviewResponse.builder()
                .id(savedReview.getId())
                .difficulty(savedReview.getDifficulty())
                .repetition(savedReview.getRepetition())
                .easeFactor(savedReview.getEaseFactor())
                .intervalDays(savedReview.getIntervalDays())
                .nextReviewDate(savedReview.getNextReviewDate())
                .createdAt(savedReview.getCreatedAt() != null ? savedReview.getCreatedAt() : LocalDateTime.now())
                .wordId(word.getId())
                .wordName(word.getName())
                .wordDefinition(word.getDefinition())
                .wordIPA(word.getIpa())
                .userId(userPrincipal.getId())
                .build();
    }

    private int mapDifficultyToQuality(String difficulty) {
        if (difficulty == null)
            return 0;
        switch (difficulty.toUpperCase()) {
            case "EASY":
                return 5;
            case "GOOD":
                return 4;
            case "HARD":
                return 3;
            case "AGAIN":
            default:
                return 0;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DailyStudyStatsResponse getDailyStats(UserPrincipal userPrincipal) {
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);

        long reviewedToday = flashcardReviewRepository.countDistinctWordsReviewedToday(userPrincipal.getId(),
                startOfDay);
        long dueToday = flashcardReviewRepository.countTotalDueWordsByUserId(userPrincipal.getId(), endOfDay);
        long totalReviews = flashcardReviewRepository.countByUserId(userPrincipal.getId());
        int streak = calculateStreak(userPrincipal.getId());

        return DailyStudyStatsResponse.builder()
                .reviewedTodayCount(reviewedToday)
                .dueTodayCount(dueToday)
                .totalReviewsCount(totalReviews)
                .streakDays(streak)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public int calculateStreak(Long userId) {
        List<Object> reviewDates = flashcardReviewRepository.findReviewDatesByUserId(userId);
        if (reviewDates.isEmpty())
            return 0;

        int streak = 0;
        LocalDate today = LocalDate.now();

        // Handle potential different types returned by the query based on DB (e.g.
        // java.sql.Date or java.time.LocalDate)
        LocalDate lastDate = convertToLocalDate(reviewDates.get(0));

        if (!lastDate.equals(today) && !lastDate.equals(today.minusDays(1))) {
            return 0;
        }

        LocalDate current = lastDate;
        for (Object dateObj : reviewDates) {
            LocalDate d = convertToLocalDate(dateObj);
            if (d.equals(current)) {
                streak++;
                current = current.minusDays(1);
            } else if (d.isAfter(current)) {
                continue;
            } else {
                break;
            }
        }
        return streak;
    }

    private LocalDate convertToLocalDate(Object dateObj) {
        if (dateObj instanceof java.sql.Date) {
            return ((java.sql.Date) dateObj).toLocalDate();
        } else if (dateObj instanceof java.time.LocalDate) {
            return (java.time.LocalDate) dateObj;
        } else if (dateObj instanceof java.util.Date) {
            return new java.sql.Date(((java.util.Date) dateObj).getTime()).toLocalDate();
        }
        throw new IllegalArgumentException("Unsupported date type: " + dateObj.getClass().getName());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FlashcardReviewResponse> getReviewHistory(LocalDate date, Pageable pageable,
            UserPrincipal userPrincipal) {
        LocalDateTime start;
        LocalDateTime end;
        if (date != null) {
            start = date.atStartOfDay();
            end = date.atTime(LocalTime.MAX);
        } else {
            // Default to all history if no date provided? Better to provide a default range
            // or just all if possible.
            // But the repository method expects start/end. Let's use a very old date as
            // start if null.
            start = LocalDateTime.of(2000, 1, 1, 0, 0);
            end = LocalDateTime.now();
        }

        Page<FlashcardReview> reviewPage = flashcardReviewRepository
                .findByUserIdAndCreatedAtBetween(userPrincipal.getId(), start, end, pageable);
        return mapToPageResponse(reviewPage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HeatmapDataResponse> getHeatmapData(int month, int year, UserPrincipal userPrincipal) {
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());

        LocalDateTime start = firstDay.atStartOfDay();
        LocalDateTime end = lastDay.atTime(LocalTime.MAX);

        List<Object[]> results = flashcardReviewRepository.countReviewsByDay(userPrincipal.getId(), start, end);

        return results.stream()
                .map(row -> {
                    LocalDate date;
                    if (row[0] instanceof java.sql.Date) {
                        date = ((java.sql.Date) row[0]).toLocalDate();
                    } else if (row[0] instanceof java.util.Date) {
                        date = new java.sql.Date(((java.util.Date) row[0]).getTime()).toLocalDate();
                    } else if (row[0] instanceof java.time.LocalDate) {
                        date = (java.time.LocalDate) row[0];
                    } else {
                        date = LocalDate.parse(row[0].toString());
                    }

                    return HeatmapDataResponse.builder()
                            .date(date)
                            .reviewCount(((Number) row[1]).longValue())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FlashcardReviewResponse> searchReviews(String keyword, Pageable pageable,
            UserPrincipal userPrincipal) {
        Page<FlashcardReview> reviewPage = flashcardReviewRepository.searchByKeyword(userPrincipal.getId(), keyword,
                pageable);
        return mapToPageResponse(reviewPage);
    }

    private PageResponse<FlashcardReviewResponse> mapToPageResponse(Page<FlashcardReview> reviewPage) {
        List<FlashcardReviewResponse> content = reviewPage.getContent().stream()
                .map(review -> FlashcardReviewResponse.builder()
                        .id(review.getId())
                        .difficulty(review.getDifficulty())
                        .repetition(review.getRepetition())
                        .easeFactor(review.getEaseFactor())
                        .intervalDays(review.getIntervalDays())
                        .nextReviewDate(review.getNextReviewDate())
                        .createdAt(review.getCreatedAt())
                        .wordId(review.getWord().getId())
                        .wordName(review.getWord().getName())
                        .wordDefinition(review.getWord().getDefinition())
                        .wordIPA(review.getWord().getIpa())
                        .userId(review.getUser().getId())
                        .build())
                .collect(Collectors.toList());

        return PageResponse.<FlashcardReviewResponse>builder()
                .content(content)
                .pageNumber(reviewPage.getNumber())
                .pageSize(reviewPage.getSize())
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .last(reviewPage.isLast())
                .build();
    }
}
