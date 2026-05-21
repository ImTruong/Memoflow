# Sequence Diagram - Học từ vựng (Use Case 3.5)

```plantuml
@startuml
title Học từ vựng - Use Case 3.5

actor User as U
participant "FlashcardSetScreen" as FSS
participant "FlashcardActionOverlay" as FAO
participant "FlashcardStudyScreen" as FSS_Study
participant "FillBlankGameScreen" as FGS
participant "flashcardApi" as API
participant "LearningLessonController" as LLC
participant "FlashcardReviewController" as FRC
participant "LearningLessonService" as LLS
participant "FlashcardReviewService" as FRS
participant "Repository" as REPO
database "MySQL DB" as DB

== LOAD FLASHCARD SETS ==

U -> FSS: Mở Bộ từ vựng
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
FSS --> U: Hiển thị tab Của tôi / Cộng đồng

U -> FSS: Chọn 1 bộ từ
FSS -> FAO: Mở tùy chọn hành động

alt Học tất cả / Học từ đến hạn
    U -> FAO: Chọn học
    FAO -> FSS_Study: navigate(setName, lessonId, onlyDue)

    FSS_Study -> API: getDailyStats()
    API -> FRC: GET /flashcard-reviews/daily-stats
    FRC -> FRS: getDailyStats(userId)
    FRS -> REPO: Query stats
    REPO -> DB: SELECT COUNT, STREAK...
    DB --> REPO: DailyStudyStats
    REPO --> FRS: Stats
    FRS --> FRC: Response
    FRC --> API: 200 OK
    API --> FSS_Study: streakDays, stats

    alt onlyDue = true
        FSS_Study -> API: getDueWords(lessonId)
        API -> LLC: GET /flashcard-lessons/{id}/due-words
    else onlyDue = false
        FSS_Study -> API: getLessonWords(lessonId)
        API -> LLC: GET /flashcard-lessons/{id}/words
    end

    LLC -> LLS: getLessonWords()/getDueWords()
    LLS -> REPO: Query words
    REPO -> DB: SELECT words by lesson / due
    DB --> REPO: Word list
    REPO --> LLS: PageResponse<WordResponse>
    LLS --> LLC: Response
    LLC --> API: 200 OK
    API --> FSS_Study: cards

    loop Với mỗi từ
        U -> FSS_Study: Flip thẻ
        U -> FSS_Study: Chọn AGAIN/HARD/GOOD/EASY
        FSS_Study -> API: recordReview(wordId, difficulty)
        API -> FRC: POST /words/{wordId}/reviews
        FRC -> FRS: save(wordId, request, user)
        FRS -> REPO: save(FlashcardReview)
        REPO -> DB: INSERT flashcard review
        DB --> REPO: Success
        REPO --> FRS: Updated review
        FRS --> FRC: FlashcardReviewResponse
        FRC --> API: 201 Created
        API --> FSS_Study: Review saved
    end

    FSS_Study --> U: Hoàn tất học flashcard

else Game điền từ
    U -> FAO: Chọn Game điền từ
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

    FGS -> FGS: FE tạo câu điền từ\nKiểm tra đáp án local\nTính lives/score
    loop Với mỗi từ
        U -> FGS: Nhập đáp án
        FGS -> FGS: So sánh với currentWord.name
        alt Đúng
            FGS -> FGS: Tăng score\nChuyển sang từ tiếp theo
        else Sai
            FGS -> FGS: Giảm lives\nHiện gợi ý
        end
    end
    FGS --> U: Kết thúc game + overlay hoàn thành
end

@enduml
```

**Scope thật từ code:**
- **FE**: `FlashcardSetScreen`, `FlashcardActionOverlay`, `FlashcardStudyScreen`, `FillBlankGameScreen`
- **BE**: `LearningLessonController`, `FlashcardReviewController`, `LearningLessonService`, `FlashcardReviewService`
- **Game**: xử lý local ở FE, chỉ gọi API lấy danh sách từ
- **Study**: FE gọi API lưu review từng từ

