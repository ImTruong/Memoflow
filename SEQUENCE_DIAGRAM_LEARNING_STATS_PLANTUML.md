# Sequence Diagram - Xem thống kê học tập

```plantuml
@startuml
title Xem thống kê học tập - Use Case 3.6

actor User as U
participant "StatsScreen" as SS
participant "VocabularyStatsOverviewScreen" as VSO
participant "WordDetailStatsScreen" as WDS
participant "VocabularyDailyStatsScreen" as VDS
participant "GrammarStatsOverviewScreen" as GSO
participant "PracticeDetailScreen" as PDS
participant "GrammarPracticeResultScreen" as GRS
participant "HTTP Layer" as HTTP
participant "StatisticsController" as StatCtrl
participant "FlashcardReviewController" as FRCtrl
participant "LearningLessonController" as LLCtrl
participant "StatisticsService" as StatSvc
participant "FlashcardReviewService" as FRSvc
participant "Repository" as REPO
database "MySQL DB" as DB

U -> SS: Mở thống kê học tập
SS -> HTTP: GET /stats/overview
HTTP -> StatCtrl: getOverviewStats(user)
StatCtrl -> StatSvc: getOverviewStats(user)
StatSvc -> REPO: Query stats
REPO -> DB: SELECT overview stats
DB --> REPO: stats
REPO --> StatSvc: OverviewStatsResponse
StatSvc --> StatCtrl: Response
StatCtrl --> HTTP: 200 OK
HTTP --> SS: overview
SS --> U: Hiển thị 2 khối\\nTừ vựng / Ngữ pháp

alt Xem thống kê từ vựng
  U -> VSO: Mở thống kê từ vựng
  VSO -> HTTP: GET /stats/vocabulary/overview
  HTTP -> StatCtrl: getVocabularyOverviewStats(user)
  StatCtrl -> StatSvc: getVocabularyOverviewStats(user)
  StatSvc -> REPO: Query vocab stats
  REPO -> DB: SELECT vocabulary stats by category
  DB --> REPO: stats
  REPO --> StatSvc: VocabularyStatsOverviewResponse
  StatSvc --> StatCtrl: Response
  StatCtrl --> HTTP: 200 OK
  HTTP --> VSO: overview
  VSO --> U: Danh mục từ vựng + donut chart

  alt Xem theo từ
    U -> WDS: Chọn 1 từ
    WDS -> HTTP: GET /flashcard-reviews/search?keyword=word
    HTTP -> FRCtrl: searchReviews(keyword, user)
    FRCtrl -> FRSvc: searchReviews(keyword, user)
    FRSvc -> REPO: Query by word
    REPO -> DB: SELECT reviews WHERE wordName=?
    DB --> REPO: history
    REPO --> FRSvc: FlashcardReviewResponse[]
    FRSvc --> FRCtrl: PageResponse
    FRCtrl --> HTTP: 200 OK
    HTTP --> WDS: lịch sử theo từ
  else Xem theo ngày
    U -> VDS: Chọn 1 ngày
    VDS -> HTTP: GET /flashcard-reviews/history?date=YYYY-MM-DD
    HTTP -> FRCtrl: getReviewHistory(date, user)
    FRCtrl -> FRSvc: getReviewHistory(date, user)
    FRSvc -> REPO: Query by date
    REPO -> DB: SELECT reviews WHERE DATE(createdAt)=?
    DB --> REPO: history
    REPO --> FRSvc: FlashcardReviewResponse[]
    FRSvc --> FRCtrl: PageResponse
    FRCtrl --> HTTP: 200 OK
    HTTP --> VDS: lịch sử theo ngày
  end

else Xem thống kê ngữ pháp
  U -> GSO: Mở thống kê ngữ pháp
  GSO -> HTTP: GET /stats/grammar/overview
  HTTP -> StatCtrl: getGrammarOverviewStats(user)
  StatCtrl -> StatSvc: getGrammarOverviewStats(user)
  StatSvc -> REPO: Query grammar stats
  REPO -> DB: SELECT grammar stats by category
  DB --> REPO: stats
  REPO --> StatSvc: GrammarStatsOverviewResponse
  StatSvc --> StatCtrl: Response
  StatCtrl --> HTTP: 200 OK
  HTTP --> GSO: overview

  U -> PDS: Chọn bài đã làm
  PDS -> HTTP: GET /grammar/practices/{id}
  HTTP -> LLCtrl: getPracticeDetail(id, user)
  LLCtrl -> StatSvc: getPracticeDetail(id)
  StatSvc -> REPO: Query practice
  REPO -> DB: SELECT practice detail
  DB --> REPO: detail
  REPO --> StatSvc: PracticeDetailResponse
  StatSvc --> LLCtrl: Response
  LLCtrl --> HTTP: 200 OK
  HTTP --> PDS: Danh sách bài theo chủ đề

  U -> GRS: Mở kết quả 1 bài
  GRS -> HTTP: GET /grammar/practices/{id}/result
  HTTP -> LLCtrl: getPracticeResult(id, user)
  LLCtrl -> StatSvc: getPracticeResult(id)
  StatSvc -> REPO: Query result
  REPO -> DB: SELECT practice result
  DB --> REPO: result
  REPO --> StatSvc: PracticeResultResponse
  StatSvc --> LLCtrl: Response
  LLCtrl --> HTTP: 200 OK
  HTTP --> GRS: Chi tiết lịch sử làm bài
end

@enduml
```

**Thành phần thực tế**
- **BE:** `StatisticsController`, `FlashcardReviewController`, `LearningLessonController`, `StatisticsService`, `FlashcardReviewService`
- **FE:** `StatsScreen`, `VocabularyStatsOverviewScreen`, `WordDetailStatsScreen`, `VocabularyDailyStatsScreen`, `ListeningStatsOverviewScreen`, `ListeningLessonsScreen`, `ListeningLessonResultScreen`, `GrammarStatsOverviewScreen`, `PracticeDetailScreen`, `GrammarPracticeResultScreen`

