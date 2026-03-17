export type ApiResponse<T> = {
  success: boolean;
  message: string;
  status: number;
  data: T;
};

export type PageResponse<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type LessonSummary = {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  content?: Record<string, any>;
  creatorName?: string;
  totalWords: number;
  learnedWords: number;
  totalDueWord: number;
};

export type FlashcardLessonResponse = {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  type: string;
  content?: Record<string, any>;
};

export type FlashcardListItem = {
  id: number;
  title: string;
  wordCount: number;
  dueCount: number;
  totalDue: number;
  author?: string;
  isPrivate?: boolean;
  icon: string;
  imageUrl?: string;
  iconBgColor: string;
  iconColor: string;
  progressBarColor: string;
  progressPercentage: number;
};

export type TabState = {
  items: FlashcardListItem[];
  pageNumber: number;
  last: boolean;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
};
export type WordResponse = {
  id: number;
  name: string;
  ipa?: string;
  imageUrl?: string;
  definition: string;
  example?: string;
  audioUrl?: string;
  flashcardLessonId: number;
};

export type FlashcardLessonDetailResponse = {
  lessonInfo: FlashcardLessonResponse;
  words: PageResponse<WordResponse>;
};

export type FlashcardReviewResponse = {
  id: number;
  difficulty: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
  repetition: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string;
  createdAt: string;
  wordId: number;
  wordName: string;
  wordDefinition: string;
  wordIPA?: string;
  userId: number;
};

export type HeatmapData = {
  date: string;
  reviewCount: number;
};

export interface DailyStudyStats {
  reviewedTodayCount: number;
  dueTodayCount: number;
  totalReviewsCount: number;
  streakDays: number;
}


