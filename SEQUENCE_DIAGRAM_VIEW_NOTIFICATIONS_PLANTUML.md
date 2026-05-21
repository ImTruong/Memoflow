# Sequence Diagram - Xem Thông báo (Use Case 3.4.2)

## PlantUML - Core Notification Management (Load & Mark as Read)

```plantuml
@startuml

title Xem Thông báo - Use Case 3.4.2\nNotification Management (Core Flow)

actor User as U
participant "NotificationScreen" as NS
participant "API Client" as AC
participant "NotificationController" as NC
participant "NotificationService" as SVC
participant "NotificationRepository" as REPO
database "MySQL Database" as DB

== MAIN FLOW: LOAD NOTIFICATIONS ==

U -> NS: Mở "Thông báo"
activate NS

NS -> AC: GET /notifications?page=0&size=10
activate AC

AC -> NC: Gửi request
activate NC

NC -> SVC: findByUserId(userId, pageable)
activate SVC

SVC -> REPO: Query with pagination
activate REPO

REPO -> DB: SELECT * FROM Notification\nWHERE userId = ?\nORDER BY createdAt DESC\nLIMIT 10 OFFSET 0
activate DB

DB --> REPO: List<Notification> (10 items)
deactivate DB

REPO --> SVC: Page<Notification>
deactivate REPO

SVC -> SVC: Convert to DTOs\n(title, message, isRead, createdAt, ...)
SVC --> NC: Page<NotificationResponse>
deactivate SVC

NC --> AC: 200 OK {Page<NotificationResponse>}
deactivate NC

AC --> NS: Notifications list
deactivate AC

NS -> NS: Separate unread & read\nDisplay with icons & timestamps

NS --> U: ✅ Hiển thị danh sách thông báo\n(Unread at top, Read below)

== EXTEND FLOW: MARK AS READ ==

U -> NS: Tap unread notification
activate NS

NS -> AC: PATCH /notifications/123/read
activate AC

AC -> NC: Mark as read request
activate NC

NC -> SVC: markAsRead(notificationId: 123)
activate SVC

SVC -> REPO: findById(123)
activate REPO

REPO -> DB: SELECT * FROM Notification WHERE id = 123
activate DB

DB --> REPO: Notification Entity (isRead = false)
deactivate DB

REPO --> SVC: Notification
deactivate REPO

SVC -> SVC: Set isRead = true\nSet readAt = NOW()

SVC -> REPO: save(notification)
activate REPO

REPO -> DB: UPDATE Notification SET\nisRead = true, readAt = NOW()\nWHERE id = 123
activate DB

DB --> REPO: Success (1 row affected)
deactivate DB

REPO --> SVC: Updated Notification Entity
deactivate REPO

SVC -> SVC: Convert to DTO
SVC --> NC: NotificationResponse (isRead = true)
deactivate SVC

NC --> AC: 200 OK {NotificationResponse}
deactivate NC

AC --> NS: Success
deactivate AC

NS -> NS: Update local state\nMove to read section\nUpdate badge count

NS --> U: ✅ Thông báo đánh dấu là đã đọc
deactivate NS

@enduml
```

---

## Architecture Summary

### Frontend (React Native)
- **NotificationScreen**: Display paginated notifications, tap to mark as read
- **API Client**: GET /notifications, PATCH /notifications/{id}/read

### Backend (Spring Boot)
| Component | Responsibility |
|-----------|---|
| **NotificationController** | GET /notifications (paginated), PATCH /notifications/{id}/read |
| **NotificationService** | findByUserId(pageable), markAsRead(id) |
| **NotificationRepository** | JPA queries with pagination |
| **Notification Entity** | id, userId, title, message, isRead, createdAt, readAt |

### Key Endpoints
- `GET /notifications?page=0&size=10` - Fetch paginated notifications
- `PATCH /notifications/{id}/read` - Mark single notification as read

### Data Model
```
Notification:
  - id (Long, PK)
  - userId (Long, FK)
  - title (String)
  - message (String)
  - type (String)
  - isRead (Boolean, default: false)
  - createdAt (Timestamp)
  - readAt (Timestamp, nullable)
```

---

**Format**: PlantUML  
**Version**: 2.0 (Simplified)  
**Use Case**: 3.4.2 - Xem Thông báo  
**Core Flows**: Load notifications + Mark as read  
**Last Updated**: 2026-05-21
