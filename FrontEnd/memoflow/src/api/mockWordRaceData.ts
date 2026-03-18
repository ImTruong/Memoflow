import { UserLessonProgress } from "../types/story";

export const mockWordRaceProgress: UserLessonProgress[] = [
  {
    id: 201,
    isCompleted: false,
    progressPercent: 0,
    createdAt: "2024-03-18T12:00:00",
    learningLesson: {
      id: 11,
      title: "Học việc sơ đẳng",
      type: "WORD_RACE",
      description: "Người đạt 40 điểm trước sẽ thắng. Chế độ luyện tập cơ bản.",
      image: { url: "https://img.freepik.com/free-vector/pixel-art-style-retro-game-background_23-2149021677.jpg" },
      creator: { id: 1, username: "admin", name: "Trùm Memoflow" },
      content: {
        targetScore: 40,
        timeLimit: 15,
        botDifficulty: 'EASY',
        icon: "play-circle",
        bgColor: "#FDE2E2", // pink
        accentColor: "#D53F8C"
      }
    }
  },
  {
    id: 202,
    isCompleted: false,
    progressPercent: 0,
    createdAt: "2024-03-18T13:00:00",
    learningLesson: {
      id: 12,
      title: "Nối không với số nhiều",
      type: "WORD_RACE",
      description: "Người đạt 50 điểm trước và không kết thúc bằng 's' (số nhiều) sẽ thắng.",
      image: { url: "https://cdn-icons-png.flaticon.com/512/595/595067.png" },
      creator: { id: 1, username: "admin", name: "Trùm Memoflow" },
      content: {
        targetScore: 50,
        timeLimit: 12,
        forbiddenEndings: ["s"],
        botDifficulty: 'MEDIUM',
        icon: "close-circle",
        bgColor: "#E6FFFA", // teal
        accentColor: "#319795"
      }
    }
  },
  {
    id: 203,
    isCompleted: false,
    progressPercent: 0,
    createdAt: "2024-03-18T14:00:00",
    learningLesson: {
      id: 13,
      title: "E ... Em là không thể",
      type: "WORD_RACE",
      description: "Người đạt 50 điểm trước và không kết thúc bằng 'e' sẽ thắng.",
      image: { url: "https://emoji-copy.com/wp-content/uploads/2021/01/Collision.png" },
      creator: { id: 1, username: "admin", name: "Trùm Memoflow" },
      content: {
        targetScore: 50,
        timeLimit: 10,
        forbiddenEndings: ["e"],
        botDifficulty: 'HARD',
        icon: "flash",
        bgColor: "#FEF3C7", // yellow
        accentColor: "#D97706"
      }
    }
  },
  {
    id: 204,
    isCompleted: false,
    progressPercent: 0,
    createdAt: "2024-03-18T15:00:00",
    learningLesson: {
      id: 14,
      title: "Chạy đua tử thần",
      type: "WORD_RACE",
      description: "Thời gian điền bị rút ngắn và đạt 50 điểm trước sẽ thắng.",
      image: { url: "https://i.pinimg.com/736x/87/40/8c/87408c697818e9863a8a864700f72dc6.jpg" },
      creator: { id: 1, username: "admin", name: "Trùm Memoflow" },
      content: {
        targetScore: 50,
        timeLimit: 5,
        botDifficulty: 'HARD',
        icon: "hourglass",
        bgColor: "#F3F4F6", // gray
        accentColor: "#374151"
      }
    }
  }
];
