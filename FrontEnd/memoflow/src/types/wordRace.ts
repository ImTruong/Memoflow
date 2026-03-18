import { User, Media } from "./story";

export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface WordRaceRule {
  targetScore: number;
  timeLimit: number; // in seconds
  forbiddenEndings?: string[]; // e.g., ['s', 'e']
  botDifficulty: BotDifficulty;
  icon?: string;
  bgColor?: string;
  accentColor?: string;
}

export interface WordRaceMessage {
  id: string;
  sender: 'USER' | 'BOT';
  word: string;
  score: number;
  timestamp: string;
}

// Re-defining the LearningLesson content for Word Race
export interface WordRaceLessonContent extends WordRaceRule {
  // specific word race fields if any
}
