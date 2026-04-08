package com.memoflow.memoflow.controller;

import com.memoflow.memoflow.dto.response.ApiResponse;
import com.memoflow.memoflow.dto.response.GrammarStatsOverviewResponse;
import com.memoflow.memoflow.dto.response.ListeningStatsOverviewResponse;
import com.memoflow.memoflow.dto.response.VocabularyStatsOverviewResponse;
import com.memoflow.memoflow.dto.response.OverviewStatsResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import com.memoflow.memoflow.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<OverviewStatsResponse>> getOverviewStats(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        OverviewStatsResponse response = statisticsService.getOverviewStats(userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Overview statistics fetched successfully"));
    }

    @GetMapping("/listening/overview")
    public ResponseEntity<ApiResponse<ListeningStatsOverviewResponse>> getListeningOverviewStats(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ListeningStatsOverviewResponse response = statisticsService.getListeningOverviewStats(userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Listening overview statistics fetched successfully"));
    }

    @GetMapping("/grammar/overview")
    public ResponseEntity<ApiResponse<GrammarStatsOverviewResponse>> getGrammarOverviewStats(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        GrammarStatsOverviewResponse response = statisticsService.getGrammarOverviewStats(userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Grammar overview statistics fetched successfully"));
    }

    @GetMapping("/vocabulary/overview")
    public ResponseEntity<ApiResponse<VocabularyStatsOverviewResponse>> getVocabularyOverviewStats(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        VocabularyStatsOverviewResponse response = statisticsService.getVocabularyOverviewStats(userPrincipal);
        return ResponseEntity.ok(ApiResponse.success(response, "Vocabulary overview statistics fetched successfully"));
    }

    @GetMapping("/vocabulary/sets")
    public ResponseEntity<ApiResponse<List<com.memoflow.memoflow.dto.response.VocabularyStatsOverviewResponse.RecentSet>>> getVocabularySetsByCategory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @org.springframework.web.bind.annotation.RequestParam String category) {
        // Simple implementation: for now return recent based on category filter
        VocabularyStatsOverviewResponse overview = statisticsService.getVocabularyOverviewStats(userPrincipal);
        
        List<com.memoflow.memoflow.dto.response.VocabularyStatsOverviewResponse.RecentSet> sets = overview.getCategories().stream()
                .filter(c -> c.getName().equals(category))
                .flatMap(c -> c.getRecentSets().stream())
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(ApiResponse.success(sets, "Vocabulary sets fetched successfully"));
    }
}
