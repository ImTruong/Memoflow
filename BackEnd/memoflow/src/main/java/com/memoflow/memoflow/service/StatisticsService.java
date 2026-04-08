package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.response.GrammarStatsOverviewResponse;
import com.memoflow.memoflow.dto.response.VocabularyStatsOverviewResponse;
import com.memoflow.memoflow.dto.response.ListeningStatsOverviewResponse;
import com.memoflow.memoflow.dto.response.OverviewStatsResponse;
import com.memoflow.memoflow.security.UserPrincipal;
import java.util.List;

public interface StatisticsService {
    OverviewStatsResponse getOverviewStats(UserPrincipal userPrincipal);
    ListeningStatsOverviewResponse getListeningOverviewStats(UserPrincipal userPrincipal);
    GrammarStatsOverviewResponse getGrammarOverviewStats(UserPrincipal userPrincipal);
    VocabularyStatsOverviewResponse getVocabularyOverviewStats(UserPrincipal userPrincipal);
    List<VocabularyStatsOverviewResponse.RecentSet> getVocabularySetsByCategory(UserPrincipal userPrincipal, String category);
}
