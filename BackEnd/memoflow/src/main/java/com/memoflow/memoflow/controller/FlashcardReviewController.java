package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.request.CreateFlashcardReviewRequest;
import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.DailyStudyStatsResponse;
import com.memoflow.memoflow.dto.response.FlashcardReviewResponse;
import com.memoflow.memoflow.dto.response.HeatmapDataResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.FlashcardReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class FlashcardReviewController {

    private final FlashcardReviewService flashcardReviewService;

    @PostMapping("/words/{wordId}/reviews")
    @PreAuthorize("@securityService.canAccessWord(#wordId, #userPrincipal.id)")
    public ResponseEntity<ApiResponse<FlashcardReviewResponse>> recordReview(
            @PathVariable Long wordId,
            @Valid @RequestBody CreateFlashcardReviewRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        FlashcardReviewResponse response = flashcardReviewService.save(wordId, request, userPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Flashcard review recorded successfully"));
    }

    @GetMapping("/flashcard-reviews/daily-stats")

    public ResponseEntity<ApiResponse<DailyStudyStatsResponse>> getDailyStats(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DailyStudyStatsResponse response = flashcardReviewService.getDailyStats(userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Daily study stats fetched successfully"));
    }

    @GetMapping("/flashcard-reviews/history")

    public ResponseEntity<ApiResponse<PageResponse<FlashcardReviewResponse>>> getReviewHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Pageable pageable,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PageResponse<FlashcardReviewResponse> response = flashcardReviewService.getReviewHistory(date, pageable, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Review history fetched successfully"));
    }

    @GetMapping("/flashcard-reviews/heatmap")

    public ResponseEntity<ApiResponse<List<HeatmapDataResponse>>> getHeatmapData(
            @RequestParam int month,
            @RequestParam int year,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<HeatmapDataResponse> response = flashcardReviewService.getHeatmapData(month, year, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Heatmap data fetched successfully"));
    }

    @GetMapping("/flashcard-reviews/search")

    public ResponseEntity<ApiResponse<PageResponse<FlashcardReviewResponse>>> searchReviews(
            @RequestParam String keyword,
            Pageable pageable,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PageResponse<FlashcardReviewResponse> response = flashcardReviewService.searchReviews(keyword, pageable, userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Review search results fetched successfully"));
    }
}
