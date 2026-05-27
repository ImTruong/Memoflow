import { LearningLesson } from './story';

// Do kho bot trong game Word Race.
export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

// Cau hinh luat cho mot man Word Race.
export interface WordRaceRule {
  targetScore: number;
  timeLimit: number; // Thoi gian moi luot, tinh bang giay.
  forbiddenEndings: string[]; // Cac ky tu khong duoc dung de ket thuc tu.
}

// Mot dong lich su luot choi cua user hoac bot.
export interface WordRaceMessage {
  id: string;
  sender: 'USER' | 'BOT';
  word: string;
  score: number;
  timestamp: string;
}

// Content JSON rieng cho lesson Word Race.
export interface WordRaceLessonContent extends WordRaceRule {}

// Lesson Word Race da gan type va content cu the.
export interface WordRaceLesson extends LearningLesson {
  type: 'WORD_RACE';
  content: WordRaceLessonContent;
}
