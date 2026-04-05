export type GrammarTopicResponse = {
  id: number;
  title: string;
  description: string;
  progressLabel: string;
  progressPercent: number;
};

export type GrammarTopicDetailResponse = {
  topicId: number;
  title: string;
  description: string;
  progressLabel: string;
  progressPercent: number;
  subLessons: {
    id: number;
    title: string;
    subTitle?: string;
    status: string;
  }[];
};

export type GrammarPracticeTaskResponse = {
  id: number;
  title: string;
  status: string;
  type: 'ACTIVE' | 'LOCKED' | 'COMPLETED';
  score?: string | null;
  count?: string | null;
  totalQuestions: number;
  difficulty?: string | null;
  durationMinutes?: number | null;
};

export type GrammarLessonDetailResponse = {
  id: number;
  title: string;
  engTitle?: string | null;
  description?: string | null;
  sections: any[];
  suggestedPracticeId?: number | null;
  practiceTasks: GrammarPracticeTaskResponse[];
};

export type GrammarPracticeOverviewResponse = {
  id: number;
  title: string;
  description: string;
  overallProgress: number;
  tasks: GrammarPracticeTaskResponse[];
};

export type GrammarPracticeDetailResponse = {
  practiceId: number;
  title: string;
  lessonTitle: string;
  overallProgress: number;
  totalQuestions: number;
  difficulty?: string | null;
  durationMinutes?: number | null;
  tasks: GrammarPracticeTaskResponse[];
};

export type GrammarPracticeQuizResponse = {
  practiceId: number;
  title: string;
  totalQuestions: number;
  questions: {
    quizId: number;
    questionText: string;
    type: string;
    explanation?: string | null;
    options: {
      optionId: number;
      optionText: string;
      orderIndex: number;
    }[];
  }[];
};

export type GrammarPracticeSubmissionResponse = {
  practiceId: number;
  answers: {
    quizId: number;
    optionId?: number | null;
    textAnswer?: string | null;
  }[];
};

export type GrammarPracticeResultResponse = {
  practiceId: number;
  title: string;
  totalQuestions: number;
  score: number;
  questions: {
    quizId: number;
    questionText: string;
    type: string;
    explanation?: string | null;
    userOptionId?: number | null;
    userTextAnswer?: string | null;
    correctOptionId?: number | null;
    correctTextAnswer?: string | null;
    correct: boolean;
    options: {
      optionId: number;
      optionText: string;
      isCorrect: boolean;
    }[];
  }[];
};
