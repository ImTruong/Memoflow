export interface LearningMode {
    id: number;
    name: string;
    description: string;
    iconMediaId: number;
}

export interface LearningActivity {
    id: number;
    title: string;
    description: string;
    iconMediaId: number;
    learningModeId: number;
}

export interface LearningLesson {
    id: number;
    title: string;
    type: string;
    description: string;
    imageMediaId?: number;
    learningActivityId: number;
    content?: any; // For theory content or specific game settings
}

export interface QuizGroup {
    id: number;
    type: 'READING' | 'LISTENING';
    audioId?: number | null;
    imageId?: number | null;
    orderIndex: number;
    learningLessonId: number;
}

export interface QuizQuestion {
    id: number;
    questionText: string;
    type: 'ĐIỀN TỪ' | 'TRẮC NGHIỆM' | 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK'; // Normalized below
    orderIndex: number;
    quizGroupId: number;
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK';

export interface QuizOption {
    id: number;
    optionText: string;
    orderIndex: number;
    isCorrect: boolean;
    quizQuestionId: number;
}

export interface QuizAnswer {
    id: number;
    answerText: string;
    quizQuestionId: number;
}

export interface UserQuizAnswer {
    id?: number;
    createdAt?: string;
    textAnswer?: string | null;
    quizQuestionId: number;
    quizOptionId?: number | null;
    userId: number;
}
