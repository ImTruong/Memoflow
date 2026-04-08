package com.memoflow.memoflow.service;

import com.memoflow.memoflow.dto.response.*;
import com.memoflow.memoflow.security.UserPrincipal;
import java.util.List;

public interface StatisticsService {
    OverviewStatsResponse getOverviewStats(UserPrincipal userPrincipal);
    ListeningStatsOverviewResponse getListeningOverviewStats(UserPrincipal userPrincipal);
    GrammarStatsOverviewResponse getGrammarOverviewStats(UserPrincipal userPrincipal);
    VocabularyStatsOverviewResponse getVocabularyOverviewStats(UserPrincipal userPrincipal);
    List<VocabularyStatsOverviewResponse.RecentSet> getVocabularySetsByCategory(UserPrincipal userPrincipal, String category);
    AdminDashboardStatsResponse getAdminDashboardStats();
}
