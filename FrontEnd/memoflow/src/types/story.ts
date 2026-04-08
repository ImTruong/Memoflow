export interface Media {
  id?: number;
  url: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  avatar?: string;
  streakDays?: number;
}

export interface LearningMode {
  id: number;
  name: string;
  description?: string;
  icon?: Media;
}

export interface LearningActivity {
  id: number;
  title: string;
  description: string;
  type?: number;
  icon?: Media;
  learningMode?: LearningMode;
}

export type LessonType = 'STORY' | 'WORD_RACE' | 'WORD_HUNT' | 'BILLINGUAL_ARTICLE' | 'TRUYEN_CHEM';

export interface LearningLesson {
  id: number;
  title: string;
  type: string; // e.g. "TRUYEN_CHEM" | "WORD_RACE"
  description: string;
  image?: Media;
  content: any; // Flexible JSON content
  learningActivity?: LearningActivity;
}

export interface UserLessonProgress {
  id: number;
  user?: User;
  learningLesson: LearningLesson;
  isCompleted: boolean;
  progressPercent: number;
  score?: number;
  createdAt: string;
  completedAt?: string;
}

// Specific content structure for Truyện Chêm
export interface StoryVocabulary {
  word: string;
  pos?: string;
  meaning?: string;
  phonetic?: string;
  audioUrl?: string;
}

export interface StoryContent {
  englishTitle: string;
  paragraphs: string[];
  vocabulary: StoryVocabulary[];
}
