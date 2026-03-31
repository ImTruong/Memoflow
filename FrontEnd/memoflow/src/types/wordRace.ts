import { LearningLesson } from './story';

export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface WordRaceRule {
  targetScore: number;
  timeLimit: number; // in seconds
  forbiddenEndings: string[]; // e.g., ['s', 'e']
}

export interface WordRaceMessage {
  id: string;
  sender: 'USER' | 'BOT';
  word: string;
  score: number;
  timestamp: string;
}

// Re-defining the LearningLesson content for Word Race
export interface WordRaceLessonContent extends WordRaceRule {}

export interface WordRaceLesson extends LearningLesson {
  type: 'WORD_RACE';
  content: WordRaceLessonContent;
}
