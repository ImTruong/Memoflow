import { LearningLesson, UserLessonProgress } from './story';

export type WordHuntDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface WordHuntVocabularyItem {
  word: string;
  meaningVi: string;
}

export interface WordHuntLessonContent {
  categoryKey: string;
  categoryLabel: string;
  boardSize: number;
  timeLimitSeconds: number;
  targetWordCount: number;
  maxHintsPerDay: number;
  difficulty: WordHuntDifficulty;
  icon: string;
  cardColor: string;
  iconColor: string;
  objectiveText: string;
  unlockRequirementText?: string;
  words: WordHuntVocabularyItem[];
}

export interface WordHuntLesson extends LearningLesson {
  type: 'WORD_HUNT';
  content: WordHuntLessonContent;
}

export interface WordHuntProgress extends Omit<UserLessonProgress, 'learningLesson'> {
  learningLesson: WordHuntLesson;
  hintsUsedToday?: number;
}

export interface WordHuntCell {
  row: number;
  col: number;
  letter: string;
}

export interface WordHuntPlacedWord {
  word: string;
  meaningVi: string;
  cells: WordHuntCell[];
}
