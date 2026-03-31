import { LearningLesson } from "../types/story";

export const mockWordRaceLessons: LearningLesson[] = [
  {
    id: 11,
    title: "Học việc sơ đẳng",
    type: "WORD_RACE",
    description: "Người đạt 40 điểm trước sẽ thắng. Chế độ luyện tập cơ bản.",
    content: {
      targetScore: 40,
      timeLimit: 15,
    },
  },
  {
    id: 12,
    title: "Nối không với số nhiều",
    type: "WORD_RACE",
    description: "Người đạt 50 điểm trước và không kết thúc bằng 's' (số nhiều) sẽ thắng.",
    content: {
      targetScore: 50,
      timeLimit: 12,
      forbiddenEndings: ["s"],
    },
  },
  {
    id: 13,
    title: "E ... Em là không thể",
    type: "WORD_RACE",
    description: "Người đạt 50 điểm trước và không kết thúc bằng 'e' sẽ thắng.",
    content: {
      targetScore: 50,
      timeLimit: 10,
      forbiddenEndings: ["e"],
    },
  },
  {
    id: 14,
    title: "Chạy đua tử thần",
    type: "WORD_RACE",
    description: "Thời gian điền bị rút ngắn và đạt 50 điểm trước sẽ thắng.",
    content: {
      targetScore: 50,
      timeLimit: 5,
    },
  },
];
