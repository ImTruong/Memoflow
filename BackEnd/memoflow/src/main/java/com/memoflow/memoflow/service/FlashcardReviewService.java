package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.request.CreateFlashcardReviewRequest;
import com.memoflow.memoflow.dto.response.DailyStudyStatsResponse;
import com.memoflow.memoflow.dto.response.FlashcardReviewResponse;
import com.memoflow.memoflow.dto.response.HeatmapDataResponse;
import com.memoflow.memoflow.dto.response.PageResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface FlashcardReviewService {

    FlashcardReviewResponse save(Long wordId, CreateFlashcardReviewRequest createFlashcardReviewRequest, UserPrincipal userPrincipal);

    DailyStudyStatsResponse getDailyStats(UserPrincipal userPrincipal);

    PageResponse<FlashcardReviewResponse> getReviewHistory(LocalDate date, Pageable pageable, UserPrincipal userPrincipal);

    List<HeatmapDataResponse> getHeatmapData(int month, int year, UserPrincipal userPrincipal);

    PageResponse<FlashcardReviewResponse> searchReviews(String keyword, Pageable pageable, UserPrincipal userPrincipal);
}
