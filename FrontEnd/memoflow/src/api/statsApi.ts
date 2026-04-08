import { apiFetch } from './apiClient';

export interface OverviewStats {
  vocabularyCount: number;
  grammarCount: number;
  listeningCount: number;
  totalActivities: number;
  todayDate: string;
  weeklyActivity: number[];
}

export interface ListeningStatsOverview {
  totalExams: number;
  newExamsThisWeek: number;
  parts: PartStats[];
}

export interface PartStats {
  name: string;
  partNumber: number;
  percentage: string;
  completedCount: number;
  recentExams: string[];
  moreCount: number;
  color: string;
  iconName: string;
}

export interface GrammarStatsOverview {
  totalLessons: number;
  newLessonsThisWeek: number;
  categories: CategoryStats[];
}

export interface CategoryStats {
  name: string;
  categoryId: number;
  percentage: string;
  completedCount: number;
  recentLessons: RecentLesson[];
  moreCount: number;
  color: string;
  iconName: string;
}

export interface RecentLesson {
  id: number;
  title: string;
}

export interface VocabularyStatsOverview {
  totalSetsLearned: number;
  newWordsThisWeek: number;
  categories: VocabCategoryStats[];
}

export interface VocabCategoryStats {
  categoryId: number;
  name: string;
  percentage: string;
  completedCount: number;
  recentSets: RecentLesson[];
  moreCount: number;
  color: string;
  iconName: string;
}

export const statsApi = {
  getOverview: async (): Promise<OverviewStats> => {
    const response = await apiFetch<any>('/stats/overview');
    return response.data;
  },
  getListeningOverview: async (): Promise<ListeningStatsOverview> => {
    const response = await apiFetch<any>('/stats/listening/overview');
    return response.data;
  },
  getGrammarOverview: async (): Promise<GrammarStatsOverview> => {
    const response = await apiFetch<any>('/stats/grammar/overview');
    return response.data;
  },
  getVocabularyOverview: async (): Promise<VocabularyStatsOverview> => {
    const response = await apiFetch<any>('/stats/vocabulary/overview');
    return response.data;
  },
};
