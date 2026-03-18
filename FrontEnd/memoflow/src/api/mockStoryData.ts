import { UserLessonProgress } from '../types/story';

export const mockStoryProgress: UserLessonProgress[] = [
  {
    id: 101,
    isCompleted: false,
    progressPercent: 0,
    createdAt: "2024-03-18T10:00:00",
    learningLesson: {
      id: 1,
      title: "Sư tử và thỏ",
      type: "TRUYEN_CHEM",
      description: "Câu chuyện về trí tuệ chiến thắng sức mạnh thô bạo...",
      image: { url: "https://vapa.vn/wp-content/uploads/2022/12/anh-su-tu-va-tho-001.jpg" },
      creator: { id: 1, username: "admin", name: "Trùm Memoflow" },
      content: {
        englishTitle: "The Lion and the Rabbit",
        paragraphs: [
          "Một ngày nọ, một con Sư tử {cruel} sống trong rừng. Hàng ngày, nó giết và ăn {lot} loài vật. Muông thú {afraid} rằng Sư tử sẽ giết và ăn thịt tất cả loài vật trong khu rừng.",
          "Chúng nói với Sư tử rằng: \"Chúng ta hãy thoả thuận. Nếu ngài {promise} rằng mỗi ngày ngài chỉ ăn một con vật, thì hàng ngày một trong số chúng tôi sẽ tới đây nộp mạng. Ngài sẽ không phải {hunt} và giết chúng tôi nữa\".",
          "Sư tử thấy thoả thuận nghe rất {well} nên nó đã {agreed}, nhưng nó cũng nói rằng: \"Nếu mỗi ngày không có một đứa tới nạp mạng, tao sẽ giết tất cả chúng mày vào ngày hôm sau!\"."
        ],
        vocabulary: [
          { word: "Cruel", pos: "Tính Từ", meaning: "Hung Bạo", phonetic: "/ˈkruːəl/" },
          { word: "Lot", pos: "Phó Từ", meaning: "Nhiều", phonetic: "/lɒt/" },
          { word: "Afraid", pos: "Tính Từ", meaning: "Sợ Hãi", phonetic: "/əˈfreɪd/" },
          { word: "Promise", pos: "Động Từ", meaning: "Hứa", phonetic: "/ˈprɒm.ɪs/" },
          { word: "Hunt", pos: "Động Từ", meaning: "Săn Bắt", phonetic: "/hʌnt/" },
          { word: "Well", pos: "Trạng từ", meaning: "Ổn, Tốt", phonetic: "/wel/" },
          { word: "Agreed", pos: "Động từ", meaning: "Đồng ý", phonetic: "/əˈɡriː/" }
        ]
      }
    }
  },
  {
    id: 102,
    isCompleted: false,
    progressPercent: 0,
    createdAt: "2024-03-18T11:00:00",
    learningLesson: {
      id: 2,
      title: "Phòng thí nghiệm",
      type: "TRUYEN_CHEM",
      description: "Những khám phá kỳ thú trong thế giới khoa học...",
      image: { url: "https://img.freepik.com/free-vector/scientist-working-science-lab_1308-41003.jpg" },
      creator: { id: 1, username: "admin", name: "Trùm Memoflow" },
      content: {
        englishTitle: "The Laboratory",
        paragraphs: [
          "Trong một {laboratory} hiện đại, các nhà khoa học đang {experiment} để tìm ra phương pháp mới. Họ sử dụng nhiều {chemicals} khác nhau."
        ],
        vocabulary: [
          { word: "Laboratory", pos: "Danh Từ", meaning: "Phòng thí nghiệm", phonetic: "/ləˈbɒr.ə.tər.i/" },
          { word: "Experiment", pos: "Động Từ", meaning: "Thí nghiệm", phonetic: "/ɪkˈsper.ɪ.mənt/" },
          { word: "Chemicals", pos: "Danh Từ", meaning: "Hóa chất", phonetic: "/ˈkem.ɪ.kəlz/" }
        ]
      }
    }
  },
  {
    id: 103,
    isCompleted: true,
    progressPercent: 100,
    completedAt: "2024-03-19T01:00:00",
    createdAt: "2024-03-17T09:00:00",
    learningLesson: {
      id: 3,
      title: "Chiếc chuông trên cổ chú chó",
      type: "TRUYEN_CHEM",
      description: "Bài học về sự cảnh giác và an toàn...",
      image: { url: "https://i.ytimg.com/vi/S3eP69_Tf20/maxresdefault.jpg" },
      creator: { id: 1, username: "admin", name: "Trùm Memoflow" },
      content: {
        englishTitle: "The Dog's Bell",
        paragraphs: [
          "Có một chú chó rất {aggressive}. Chủ của nó quyết định buộc một chiếc {bell} vào cổ nó để mọi người có thể {avoid} nó."
        ],
        vocabulary: [
          { word: "Aggressive", pos: "Tính Từ", meaning: "Hung hăng", phonetic: "/əˈɡres.ɪv/" },
          { word: "Bell", pos: "Danh Từ", meaning: "Chiếc chuông", phonetic: "/bel/" },
          { word: "Avoid", pos: "Động Từ", meaning: "Tránh né", phonetic: "/əˈvɔɪd/" }
        ]
      }
    }
  }
];
