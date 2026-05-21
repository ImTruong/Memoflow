# Sơ đồ Lớp (Class Diagram) - Các Chức Năng Cốt Lõi của Memoflow (Cập nhật)

Dưới đây là sơ đồ lớp chi tiết biểu diễn các Thực thể (Entities) của hệ thống tương ứng với các chức năng yêu cầu (đã loại bỏ: `VerificationCode`, `Message`, `DeviceToken`, `ChatSession` theo yêu cầu):
1. **Quản lý thông tin cá nhân**: Cập nhật, bảo mật thông tin tài khoản.
2. **Thông báo thời gian thực (realtime)**: Sử dụng WebSocket kết nối người dùng.
3. **Học từ vựng qua Flashcard (cá nhân hóa, game hóa & tích hợp Gemini AI)**: Lịch học nhắc nhở theo đường cong lãng quên (SuperMemo SM-2), câu hỏi sinh bởi AI, trò chơi hóa điền từ.
4. **Thống kê học tập**: Theo dõi tiến độ cho cả 3 kỹ năng (Vocabulary, Listening, Grammar).

```mermaid
classDiagram
    direction TB

    %% ==========================================
    %% 1. QUẢN LÝ THÔNG TIN CÁ NHÂN (PERSONAL INFO)
    %% ==========================================
    class User {
        +Long id
        +String name
        +LocalDate dateOfBirth
        +String email
        +String password
        +boolean isRegistered
        +String facebookId
        +Media avatar
        +Role role
        +Setting settings
    }

    class Role {
        +Long id
        +String name
        +String description
    }

    class Media {
        +Long id
        +String url
        +String publicId
        +MediaType type
    }

    class Setting {
        +Long userId
        +User user
        +Boolean studyReminderEnabled
        +Boolean streakReminderEnabled
        +Boolean timeWindow
        +LocalTime morningReminderTime
        +LocalTime eveningReminderTime
    }

    %% ==========================================
    %% 2. THÔNG BÁO THỜI GIAN THỰC (NOTIFICATION)
    %% ==========================================
    class Notification {
        +Long id
        +String type
        +String title
        +String message
        +Media image
        +String data
        +Boolean isRead
        +LocalDateTime scheduledTime
        +LocalDateTime createdAt
        +User user
    }

    %% ==========================================
    %% 3. HỌC TỪ VỰNG FLASHCARD (PERSONALIZATION, AI, GAMIFICATION)
    %% ==========================================
    class LearningMode {
        +Long id
        +String name
        +String description
        +Media icon
    }

    class LearningActivity {
        +Long id
        +String title
        +String description
        +Integer type
        +Media icon
        +LearningMode learningMode
    }

    class LearningLesson {
        +Long id
        +String title
        +String type
        +String description
        +boolean deleted
        +Media image
        +Map~String,Object~ content
        +LearningActivity learningActivity
        +User creator
        +List~QuizGroup~ quizGroups
    }

    class Word {
        +Long id
        +String name
        +String ipa
        +Media audio
        +Media image
        +String example
        +String definition
        +boolean deleted
        +LearningLesson learningLesson
    }

    %% Thiết kế nhắc lịch ôn tập theo đường cong lãng quên (SuperMemo SM-2)
    class FlashcardReview {
        +Long id
        +String difficulty
        +Integer repetition
        +Double easeFactor
        +Integer intervalDays
        +LocalDateTime nextReviewDate
        +LocalDateTime createdAt
        +Word word
        +User user
    }

    %% Thiết kế phục vụ sinh bài tập trắc nghiệm tự động qua Gemini AI và game hóa
    class QuizGroup {
        +Long id
        +String type
        +Media audio
        +Media image
        +Integer orderIndex
        +LearningLesson learningLesson
        +List~QuizQuestion~ quizQuestions
        +String transcript
        +String translation
    }

    class QuizQuestion {
        +Long id
        +String questionText
        +String type
        +Integer orderIndex
        +QuizGroup quizGroup
        +List~QuizOption~ quizOptions
        +String translation
    }

    class QuizOption {
        +Long id
        +String optionText
        +Integer orderIndex
        +Boolean isCorrect
        +QuizQuestion quizQuestion
    }

    class QuizAnswer {
        +Long id
        +String answerText
        +QuizQuestion quizQuestion
    }

    class UserQuizAnswer {
        +Long id
        +LocalDateTime createdAt
        +String textAnswer
        +QuizQuestion quizQuestion
        +QuizOption quizOption
        +User user
    }

    %% ==========================================
    %% 4. THỐNG KÊ HỌC TẬP (LEARNING STATISTICS)
    %% ==========================================
    class UserLessonProgress {
        +Long id
        +User user
        +LearningLesson learningLesson
        +Boolean isCompleted
        +Double progressPercent
        +Integer score
        +Integer hintsUsedToday
        +LocalDate hintsUsedDate
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
        +LocalDateTime completedAt
    }

    %% ==========================================
    %% MỐI QUAN HỆ GIỮA CÁC THỰC THỂ (RELATIONSHIPS)
    %% ==========================================
    User "1" --> "1" Role : role
    User "1" --> "0..1" Media : avatar
    User "1" <--> "1" Setting : settings
    
    Notification "0..*" --> "1" User : user
    Notification "0..*" --> "0..1" Media : image

    LearningActivity "0..*" --> "1" LearningMode : learningMode
    LearningActivity "0..*" --> "0..1" Media : icon
    LearningMode "0..*" --> "0..1" Media : icon

    LearningLesson "0..*" --> "1" LearningActivity : learningActivity
    LearningLesson "0..*" --> "0..1" Media : image
    LearningLesson "0..*" --> "0..1" User : creator

    Word "0..*" --> "1" LearningLesson : learningLesson
    Word "0..*" --> "0..1" Media : audio
    Word "0..*" --> "0..1" Media : image

    FlashcardReview "0..*" --> "1" Word : word
    FlashcardReview "0..*" --> "1" User : user

    QuizGroup "0..*" --> "1" LearningLesson : learningLesson
    QuizGroup "0..*" --> "0..1" Media : audio
    QuizGroup "0..*" --> "0..1" Media : image
    QuizQuestion "0..*" --> "1" QuizGroup : quizGroup
    QuizOption "0..*" --> "1" QuizQuestion : quizQuestion
    QuizAnswer "0..*" --> "1" QuizQuestion : quizQuestion

    UserQuizAnswer "0..*" --> "1" QuizQuestion : quizQuestion
    UserQuizAnswer "0..*" --> "0..1" QuizOption : quizOption
    UserQuizAnswer "0..*" --> "1" User : user

    UserLessonProgress "0..*" --> "1" User : user
    UserLessonProgress "0..*" --> "1" LearningLesson : learningLesson
```
