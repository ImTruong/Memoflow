import { LearningMode, LearningActivity, LearningLesson, QuizGroup, QuizQuestion, QuizOption, QuizAnswer } from '../types/learning';

export const learningModes: LearningMode[] = [
  { id: 1, name: 'Từ vựng', description: 'Ghi nhớ theo đường cong lãng quên', iconMediaId: 2 },
  { id: 2, name: 'Ngữ pháp', description: 'Lý thuyết và Trắc nghiệm', iconMediaId: 3 },
  { id: 3, name: 'Luyện nghe', description: 'Đề thi mẫu Toeic', iconMediaId: 4 },
];

export const learningActivities: LearningActivity[] = [
  { id: 1, title: 'Flashcard', description: 'Luyện nhớ nhanh qua thẻ', iconMediaId: 5, learningModeId: 1 },
  { id: 2, title: 'Truyện chêm', description: 'Học từ vựng qua ngữ cảnh', iconMediaId: 5, learningModeId: 1 },
  { id: 3, title: 'Bài viết song ngữ', description: 'Đọc hiểu Anh-Việt mỗi ngày', iconMediaId: 5, learningModeId: 1 },
  { id: 4, title: 'Đua từ với Bot', description: 'Thử thách tốc độ phản xạ', iconMediaId: 5, learningModeId: 1 },
  { id: 5, title: 'Tinh mắt tìm từ', description: 'Tìm từ ẩn trong mê cung', iconMediaId: 5, learningModeId: 1 },
  { id: 6, title: 'Lý thuyết', description: 'Lý thuyết cơ bản', iconMediaId: 5, learningModeId: 2 },
  { id: 7, title: 'Trắc nghiệm', description: 'Trắc nghiệm tổng hợp', iconMediaId: 5, learningModeId: 2 },
  { id: 8, title: 'Trắc nghiệm', description: 'Trắc nghiệm luyện nghe', iconMediaId: 5, learningModeId: 3 },
];

export const grammarLessons: LearningLesson[] = [
  {
    id: 1,
    title: 'Các thì (Tenses)',
    type: 'GRAMMAR_TOPIC',
    description: '12 thì cơ bản trong tiếng Anh',
    learningActivityId: 6,
    content: {
      progress: '12/24 Đã học',
      subLessons: [
        { id: 11, title: 'Thì hiện tại đơn', subTitle: 'Present Simple', status: 'Đã xong' },
        { id: 12, title: 'Thì hiện tại tiếp diễn', subTitle: 'Present Continuous', status: 'Dang học' },
        { id: 13, title: 'Thì quá khứ đơn', subTitle: 'Past Simple', status: 'Chưa học' },
        { id: 14, title: 'Thì quá khứ tiếp diễn', subTitle: 'Past Continuous', status: 'Chưa học' },
        { id: 15, title: 'Thì tương lai đơn', subTitle: 'Future Simple', status: 'Chưa học' },
      ]
    }
  },
  {
    id: 2,
    title: 'Dạng câu (Structures)',
    type: 'GRAMMAR_TOPIC',
    description: 'Câu điều kiện, bị động...',
    learningActivityId: 6,
    content: {
       progress: '5/10 Đã học',
       subLessons: []
    }
  },
  {
    id: 3,
    title: 'Từ loại (Parts of speech)',
    type: 'GRAMMAR_TOPIC',
    description: 'Danh từ, động từ, tính từ...',
    learningActivityId: 6,
    content: {
       progress: '2/15 Đã học',
       subLessons: []
    }
  }
];

export const detailedLessonContent: Record<number, any> = {
  11: {
    title: 'Hiện tại đơn',
    engTitle: 'Present Simple',
    description: 'Thì hiện tại đơn diễn tả một chân lý, một sự thật hiển nhiên hoặc thói quen xảy ra thường xuyên',
    sections: [
      {
        id: 1,
        title: '1. Cấu trúc',
        type: 'formula',
        formula: 'S + V(s/es) + O',
        examples: [
          { text: 'She plays tennis every Sunday.', translated: 'Cô ấy chơi quần vợt vào mỗi Chủ Nhật.', highlight: 'plays' },
          { text: 'They work in a bank.', translated: 'Họ làm việc tại một ngân hàng.', highlight: 'work' }
        ]
      },
      {
        id: 2,
        title: '2. Cách dùng',
        type: 'usage',
        items: [
          { icon: 'clock-outline', title: 'Thói quen hàng ngày', description: 'Diễn tả hành động lặp đi lặp lại.', example: 'I usually get up at 6 AM.' },
          { icon: 'earth', title: 'Sự thật hiển nhiên', description: 'Chân lý không thể thay đổi.', example: 'The sun rises in the East.' },
          { icon: 'calendar', title: 'Lịch trình cố định', description: 'Tàu xe, máy bay, thời gian biểu.', example: 'The train leaves at 8 PM.' }
        ]
      },
      {
        id: 3,
        title: '3. Dấu hiệu nhận biết',
        type: 'markers',
        groups: [
          {
            title: 'TRẠNG TỪ TẦN SUẤT',
            items: ['Always', 'Usually', 'Often', 'Sometimes', 'Seldom', 'Never']
          },
          {
            title: 'CỤM TỪ CHỈ THỜI GIAN',
            items: ['Every + (day / week / month / year)', 'Once / Twice / Three times + a week']
          }
        ]
      }
    ]
  },
  12: {
    title: 'Hiện tại tiếp diễn',
    engTitle: 'Present Continuous',
    description: 'Thì hiện tại tiếp diễn tả hành động đang xảy ra tại thời điểm nói hoặc xung quanh thời điểm nói',
    sections: [
      {
        id: 1,
        title: '1. Cấu trúc',
        type: 'formula',
        formula: 'S + am/is/are + V-ing',
        examples: [
          { text: 'I am studying English now.', translated: 'Tôi đang học tiếng Anh bây giờ.', highlight: 'am studying' },
          { text: 'They are playing football.', translated: 'Họ đang chơi bóng đá.', highlight: 'are playing' }
        ]
      },
      {
        id: 2,
        title: '2. Cách dùng',
        type: 'usage',
        items: [
          { icon: 'clock-outline', title: 'Hành động đang diễn ra', description: 'Đang xảy ra ngay lúc nói.', example: 'Look! The bus is coming.' },
          { icon: 'trending-up', title: 'Sự thay đổi, phát triển', description: 'Tình huống đang dần thay đổi.', example: 'My English is improving.' }
        ]
      },
      {
        id: 3,
        title: '3. Dấu hiệu nhận biết',
        type: 'markers',
        groups: [
          {
            title: 'TRẠNG TỪ CHỈ THỜI GIAN',
            items: ['Now', 'Right now', 'At the moment', 'At present']
          },
          {
            title: 'ĐỘNG TỪ MỆNH LỆNH',
            items: ['Look!', 'Listen!', 'Keep silent!', 'Be careful!']
          }
        ]
      }
    ]
  }
};

export const practiceLessons: LearningLesson[] = [
    {
        id: 101,
        title: 'Bài tập Hiện tại đơn',
        type: 'PRACTICE',
        description: 'Luyện tập các kiến thức về thì hiện tại đơn',
        learningActivityId: 7,
        content: {
            overallProgress: 33,
            tasks: [
                { id: 201, title: 'Bài tập 1: Động từ tobe', status: 'Đã làm', score: '8/10 điểm', type: 'COMPLETED' },
                { id: 202, title: 'Bài tập 2: Trợ động từ', status: 'Chưa làm', count: '15 câu', type: 'ACTIVE' },
                { id: 203, title: 'Test Tổng Hợp', status: 'Chưa làm', count: '20 câu', type: 'LOCKED' },
            ]
        }
    }
];

export const quizGroups: QuizGroup[] = [
    { id: 10, type: 'READING', audioId: null, imageId: null, orderIndex: 1, learningLessonId: 202 }
];

export const quizQuestions: QuizQuestion[] = [
    { id: 50, questionText: 'If it rains tomorrow, we _____ the picnic.', type: 'TRẮC NGHIỆM', orderIndex: 1, quizGroupId: 10 },
    { id: 51, questionText: 'She _____ (go) to school everyday.', type: 'ĐIỀN TỪ', orderIndex: 2, quizGroupId: 10 },
    { id: 52, questionText: 'They _____ (play) soccer now.', type: 'ĐIỀN TỪ', orderIndex: 3, quizGroupId: 10 },
];

export const quizOptions: QuizOption[] = [
    { id: 150, optionText: 'cancel', orderIndex: 1, isCorrect: false, quizQuestionId: 50 },
    { id: 151, optionText: 'will cancel', orderIndex: 2, isCorrect: true, quizQuestionId: 50 },
    { id: 152, optionText: 'cancelled', orderIndex: 3, isCorrect: false, quizQuestionId: 50 },
    { id: 153, optionText: 'would cancel', orderIndex: 4, isCorrect: false, quizQuestionId: 50 },
];

export const quizAnswers: QuizAnswer[] = [
    { id: 1, answerText: 'goes', quizQuestionId: 51 },
    { id: 2, answerText: 'are playing', quizQuestionId: 52 },
];
