import { LearningLesson, UserLessonProgress } from './story';

// Content JSON rieng cho lesson Word Hunt.
export interface WordHuntLessonContent {
  categoryKey: string;
  categoryLabel: string;
  boardSize: number;
  timeLimitSeconds: number;
  targetWordCount: number;
  maxHintsPerDay: number;
  objectiveText: string;
  unlockRequirementText?: string;
  words: string[];
}

// Lesson Word Hunt da gan type va content cu the.
export interface WordHuntLesson extends LearningLesson {
  type: 'WORD_HUNT';
  content: WordHuntLessonContent;
}

// Tien do Word Hunt kem thong tin goi y theo ngay.
export interface WordHuntProgress extends Omit<UserLessonProgress, 'learningLesson'> {
  learningLesson: WordHuntLesson;
  hintsUsedToday?: number;
  hintsUsedDate?: string;
}

// Mot o chu cai tren bang Word Hunt.
export interface WordHuntCell {
  row: number;
  col: number;
  letter: string;
}

// Mot tu da duoc dat vao bang kem danh sach toa do cac o.
export interface WordHuntPlacedWord {
  word: string;
  cells: WordHuntCell[];
}
