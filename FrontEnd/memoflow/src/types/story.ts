export interface Media {
  id?: number;
  url: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  avatar?: string;
}

export interface LearningLesson {
  id: number;
  title: string;
  type: string; // e.g. "TRUYEN_CHEM"
  description: string;
  image?: Media;
  content: Record<string, any>; // JSON
  creator: User;
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
  pos: string;
  meaning: string;
  phonetic?: string;
  audioUrl?: string;
}

export interface StoryContent {
  englishTitle: string;
  paragraphs: string[];
  vocabulary: StoryVocabulary[];
  imageUrl?: string;
}
