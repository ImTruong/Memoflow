// Thong tin file media tra ve tu backend, dung chinh cho anh lesson.
export interface Media {
  id?: number;
  url: string;
}

// Thong tin user co ban dung trong man hoc va tien do.
export interface User {
  id: number;
  username: string;
  name: string;
  avatar?: string;
  streakDays?: number;
}

// Nhom hinh thuc hoc tap cha cua activity.
export interface LearningMode {
  id: number;
  name: string;
  description?: string;
  icon?: Media;
}

// Activity hoc tap chua cac lesson con.
export interface LearningActivity {
  id: number;
  title: string;
  description: string;
  type?: number;
  icon?: Media;
  learningMode?: LearningMode;
}

// Cac loai lesson frontend co the dieu huong va render.
export type LessonType = 'STORY' | 'WORD_RACE' | 'WORD_HUNT' | 'BILLINGUAL_ARTICLE' | 'TRUYEN_CHEM';

// Lesson chung, content la JSON linh hoat theo tung loai bai.
export interface LearningLesson {
  id: number;
  title: string;
  type: string; // Vi du: "TRUYEN_CHEM" | "WORD_RACE"
  description: string;
  image?: Media;
  content: any; // JSON content linh hoat theo tung loai lesson.
  learningActivity?: LearningActivity;
}

// Tien do hoc/choi cua user theo tung lesson.
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
// Cau truc mot tu vung trong truyen chem.
export interface StoryVocabulary {
  word: string;
  pos?: string;
  meaning?: string;
  phonetic?: string;
  audioUrl?: string;
}

// Cau truc content rieng cho truyen chem.
export interface StoryContent {
  englishTitle: string;
  paragraphs: string[];
  vocabulary: StoryVocabulary[];
}
