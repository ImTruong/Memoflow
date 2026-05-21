# Sequence Diagram - Học theo chủ đề -> Game điền từ -> Ôn lại từ vừa học

```plantuml
@startuml
title Vocabulary Flow - Topic Study -> Fill Blank Game -> Review Learned Words

actor User as U
participant "VocabularyLearningScreen" as VLS
participant "FlashcardSetScreen" as FSS
participant "FlashcardActionOverlay" as FAO
participant "FlashcardStudyScreen" as STS
participant "FillBlankGameScreen" as FGS
participant "AppliedExerciseScreen" as AES
participant "flashcardApi" as API
participant "LearningLessonController" as LLC
participant "FlashcardReviewController" as FRC
participant "LearningLessonService" as LLS
participant "FlashcardReviewService" as FRS
participant "aiProviderApi" as AI
participant "Free LLM Service" as LLM
participant "Repository" as REPO
database "MySQL DB" as DB

== 1. CHỌN HỌC TỪ VỰNG / CHỦ ĐỀ ==

U -> VLS: Chọn Flashcard
VLS -> FSS: Mở FlashcardSetScreen
FSS -> API: getMyLessons()/getCommunityLessons()
API -> LLC: GET /flashcard-lessons/my\nGET /flashcard-lessons/community
LLC -> LLS: getMyFlashcardLessons()/getCommunityFlashcardLessons()
LLS -> REPO: Query lessons
REPO -> DB: SELECT flashcard lessons
DB --> REPO: Lesson summaries
REPO --> LLS: PageResponse<LessonSummary>
LLS --> LLC: Response
LLC --> API: 200 OK
API --> FSS: Danh sách bộ thẻ
FSS --> U: Hiển thị bộ từ

U -> FSS: Chọn 1 bộ theo chủ đề
FSS -> FAO: Mở tùy chọn hành động
U -> FAO: Chọn "Học tất cả"
FAO -> STS: navigate(setName, lessonId, onlyDue=false)

STS -> API: getDailyStats()
API -> FRC: GET /flashcard-reviews/daily-stats
FRC -> FRS: getDailyStats(userId)
FRS -> REPO: Query stats
REPO -> DB: SELECT COUNT, STREAK...
DB --> REPO: DailyStudyStats
REPO --> FRS: Stats
FRS --> FRC: Response
FRC --> API: 200 OK
API --> STS: stats

STS -> API: getLessonWords(lessonId, 0, 100)
API -> LLC: GET /flashcard-lessons/{id}/words
LLC -> LLS: getLessonWords(lessonId, page)
LLS -> REPO: Query words by lesson
REPO -> DB: SELECT words by lesson
DB --> REPO: Word list
REPO --> LLS: PageResponse<WordResponse>
LLS --> LLC: Response
LLC --> API: 200 OK
API --> STS: cards

loop Với mỗi thẻ
    U -> STS: Flip thẻ / xem nghĩa
    U -> STS: Chọn AGAIN/HARD/GOOD/EASY
    STS -> API: recordReview(wordId, difficulty)
    API -> FRC: POST /words/{wordId}/reviews
    FRC -> FRS: save(wordId, request, user)
    FRS -> REPO: save(FlashcardReview)
    REPO -> DB: INSERT flashcard review
    DB --> REPO: Success
    REPO --> FRS: Updated review
    FRS --> FRC: FlashcardReviewResponse
    FRC --> API: 201 Created
    API --> STS: Review saved
end

STS --> U: Hoàn tất học theo chủ đề

== 2. CHƠI GAME ĐIỀN TỪ (XỬ LÝ FE) ==

U -> FAO: Chọn "Game điền từ"
FAO -> FGS: navigate(setName, lessonId)
FGS -> API: getLessonWords(lessonId, 0, 100)
API -> LLC: GET /flashcard-lessons/{id}/words
LLC -> LLS: getLessonWords(lessonId, page)
LLS -> REPO: Query words
REPO -> DB: SELECT words by lesson
DB --> REPO: Word list
REPO --> LLS: PageResponse<WordResponse>
LLS --> LLC: Response
LLC --> API: 200 OK
API --> FGS: cards

FGS -> FGS: FE tạo câu điền từ\nso sánh đáp án local\nchấm lives/score
loop Với mỗi từ
    U -> FGS: Nhập đáp án
    FGS -> FGS: So sánh currentWord.name
    alt Đúng
        FGS -> FGS: Tăng score\nchuyển sang từ tiếp theo
    else Sai
        FGS -> FGS: Giảm lives\nhiện gợi ý
    end
end
FGS --> U: Kết thúc game + overlay hoàn thành

== 3. ÔN LẠI TỪ VỪA HỌC (GỌI API NGOÀI) ==

U -> VLS: Chọn bài ôn tập hôm nay
VLS -> AES: Mở AppliedExerciseScreen
AES -> API: getReviewHistory(today, 0, 50)
API -> FRC: GET /flashcard-reviews/history?date=today
FRC -> FRS: getReviewHistory(date, pageable, user)
FRS -> REPO: Query today's reviews
REPO -> DB: SELECT review history today
DB --> REPO: FlashcardReviewResponse list
REPO --> FRS: Review history
FRS --> FRC: PageResponse<FlashcardReviewResponse>
FRC --> API: 200 OK
API --> AES: Today's learned words

AES -> AI: generateTutorReply(prompt, [])
AI -> LLM: Gửi prompt bài ôn tập
LLM --> AI: JSON exercises
AI --> AES: Exercises from external AI

AES -> AES: Render trắc nghiệm / điền chỗ trống\nbased on today's learned words
AES --> U: Ôn tập từ vừa học

@enduml
```

**Thành phần thực tế dùng trong code:**
- **FE:** `VocabularyLearningScreen`, `FlashcardSetScreen`, `FlashcardActionOverlay`, `FlashcardStudyScreen`, `FillBlankGameScreen`, `AppliedExerciseScreen`
- **BE:** `LearningLessonController`, `FlashcardReviewController`, `LearningLessonService`, `FlashcardReviewService`
- **API ngoài:** `aiProviderApi` -> `Free LLM Service`

