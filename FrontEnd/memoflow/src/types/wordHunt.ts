import { LearningLesson, UserLessonProgress } from './story';

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

export interface WordHuntLesson extends LearningLesson {
  type: 'WORD_HUNT';
  content: WordHuntLessonContent;
}

export interface WordHuntProgress extends Omit<UserLessonProgress, 'learningLesson'> {
  learningLesson: WordHuntLesson;
  hintsUsedToday?: number;
  hintsUsedDate?: string;
}

export interface WordHuntCell {
  row: number;
  col: number;
  letter: string;
}

export interface WordHuntPlacedWord {
  word: string;
  cells: WordHuntCell[];
}
