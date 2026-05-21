# KIẾN TRÚC TỔNG QUAN HỆ THỐNG MEMOFLOW

Tài liệu này mô tả kiến trúc tổng quan của ứng dụng Memoflow ở mức hệ thống (System-Level Architecture), được thiết kế theo mô hình Client-Server kết hợp các dịch vụ đám mây (Cloud Services) và AI. Sơ đồ và phân tích dưới đây được thiết kế phù hợp để đưa trực tiếp vào chương Phân tích thiết kế của báo cáo tốt nghiệp hoặc báo cáo môn học.

---

## 1. Mô tả tổng quan về kiến trúc
Hệ thống Memoflow được xây dựng trên kiến trúc **Client-Server** đa nền tảng, chia làm các phân vùng chính sau:

1. **Lớp Giao diện (Client / Frontend Layer)**:
   - **Ứng dụng di động (Mobile App)**: Phát triển bằng **React Native (Expo)** hỗ trợ cả iOS và Android. Đây là giao diện tương tác chính của học viên (học từ vựng, ngữ pháp, chơi game từ vựng, làm bài trắc nghiệm, và gửi yêu cầu đàm thoại với trợ lý học tập AI).
   - **Trang quản trị (Admin Dashboard)**: Phát triển bằng **React.js (Vite)** giúp người quản trị hệ thống dễ dàng quản lý ngân hàng từ vựng, bài học, người dùng và theo dõi thống kê.
   - **Expo Notifications (Local Push)**: Thư viện hiển thị thông báo nội bộ trên thiết bị di động của học viên, tích hợp trực tiếp với ứng dụng để nhận tín hiệu và hiển thị các banner nhắc nhở.

2. **Lớp Mạng và Giao thức truyền thông (Network Layer)**:
   - Sử dụng giao thức **HTTP/REST** để thực hiện các yêu cầu đồng bộ (như đăng nhập, quản lý, lấy dữ liệu bài học, nộp bài trắc nghiệm, và **gửi/nhận tin nhắn trò chuyện với AI Gemini**).
   - Sử dụng giao thức **WebSocket (STOMP)** độc lập **chỉ dành riêng cho việc đẩy thông báo thời gian thực** (Real-time Notification Push) như nhắc nhở duy trì streak, bài học mới, hoặc nhắc học từ vựng từ Backend xuống thiết bị di động mà không cần thực hiện cơ chế kéo (pulling) liên tục.

3. **Lớp Máy chủ xử lý nghiệp vụ (Backend Server Layer)**:
   - Được phát triển bằng **Spring Boot (Java 17)** theo kiến trúc phân lớp tiêu chuẩn:
     - **REST API / Controller**: Tiếp nhận, điều phối và xác thực đầu vào của các request HTTP (bao gồm cả luồng hội thoại AI) từ Client.
     - **WebSocket Message Broker**: Trực tiếp điều phối và đẩy các gói tin thông báo thời gian thực tới các phiên kết nối đang hoạt động của người dùng.
     - **Service (Business Logic)**: Xử lý các nghiệp vụ học tập như Spaced Repetition (lặp ngắt quãng), tính điểm thi, thống kê biểu đồ tiến độ học tập, lập lịch thông báo tự động (Scheduler) và quản lý các prompt đàm thoại gửi tới mô hình AI.
     - **Repository (Data Access)**: Thực hiện ánh xạ thực thể (ORM) để truy xuất cơ sở dữ liệu qua JPA/Hibernate.

4. **Lớp Cơ sở dữ liệu & Dịch vụ liên kết (Database & External Services)**:
   - **MySQL Database**: Cơ sở dữ liệu quan hệ chính để lưu trữ dữ liệu của người dùng, tiến trình học tập, kho từ vựng, danh sách phiên kết nối Socket hiện hành (`DeviceToken`) và lịch sử trò chuyện.
   - **Google Gemini AI**: Đóng vai trò là dịch vụ LLM bên ngoài hỗ trợ giải thích nghĩa từ vựng, ngữ cảnh và trả lời các thắc mắc của học viên qua API RESTful.
   - **Cloudinary CDN**: Dịch vụ lưu trữ đám mây chuyên dụng để tối ưu và phân phối các tệp hình ảnh minh họa từ vựng và tệp âm thanh phát âm.
   - **Google OAuth**: Hỗ trợ xác thực đăng nhập nhanh bằng tài khoản Google.

---

## 2. Sơ đồ kiến trúc tổng quan hệ thống (Mermaid Diagram)

Sơ đồ dưới đây gom nhóm các thành phần có cùng vai trò thành các khối lớn để thể hiện luồng giao tiếp chính của hệ thống ở mức tổng quan:

```mermaid
flowchart TD
    %% Định nghĩa các tác nhân người dùng
    USER([👤 Học viên])
    ADMIN([👤 Quản trị viên])

    %% Khối Frontend
    subgraph CLIENT["📱 LAYER 1: CLIENT / FRONTEND"]
        direction TB
        MOBILE["📱 Mobile App (React Native - Expo)<br/>- Giao diện học tập, Flashcard, Games<br/>- Khung chat đàm thoại AI (REST HTTP)"]
        EXPO_NOTIF["🔔 Expo Notifications API<br/>(Điều phối & Hiển thị Local Push Banner)"]
        WEB["🖥️ Admin Dashboard (React - Vite)<br/>- Giao diện quản lý bài học, từ vựng<br/>- Giám sát hoạt động & Thống kê hệ thống"]
        
        MOBILE <-->|Yêu cầu / Kích hoạt| EXPO_NOTIF
    end

    %% Khối Network
    subgraph NETWORK["🔌 LAYER 2: INTERACTION & NETWORK"]
        direction LR
        HTTP["HTTP / REST API<br/>(Đồng bộ dữ liệu JSON & AI Chat)"]
        WS["WebSocket / STOMP<br/>(Chỉ dùng cho Real-time Notification Push)"]
    end

    %% Khối Backend
    subgraph SERVER["🖥️ LAYER 3: BACKEND (Spring Boot Server)"]
        direction TB
        
        subgraph SEC_FILTER["🔒 Security & Filter Layer"]
            JWT["JWT Authentication Filter<br/>& CORS Configuration"]
        end

        subgraph CONTROLLERS["🎯 REST API & WS Broker Layer"]
            CTRL_API["API Controllers<br/>(Auth, Word, Lesson, Statistics, AI Chat...)"]
            CTRL_WS["WebSocket Message Broker<br/>(Xử lý kết nối Socket đẩy thông báo)"]
        end
        
        subgraph SERVICES["⚙️ Business Logic Layer"]
            SVC_BIZ["Business Services<br/>(UserService, WordService, LessonService...)"]
            SVC_AI["AI Provider & Chat Service (REST API)"]
            SVC_NOTIF["Notification Service & Scheduler"]
        end
        
        subgraph REPOS["📦 Data Access Layer"]
            REPOS_JPA["Spring Data JPA Repositories"]
        end

        SEC_FILTER --> CTRL_API
        CTRL_API --> SVC_BIZ
        CTRL_WS --> SVC_BIZ
        SVC_BIZ --> REPOS_JPA
    end

    %% Khối Database
    subgraph DATABASE["💾 LAYER 4: DATABASE & STORAGE"]
        DB[("💾 MySQL Database<br/>- Users, Words, Lessons<br/>- Progress, Stats, Sessions<br/>- DeviceToken (Socket Session ID)")]
    end

    %% Khối dịch vụ bên thứ ba
    subgraph EXTERNAL["☁️ LAYER 5: CLOUD & AI SERVICES"]
        direction TB
        GEMINI["🤖 Google Gemini AI<br/>(Hỗ trợ giải nghĩa từ vựng qua REST)"]
        CLOUDINARY["🖼️ Cloudinary Media Cloud<br/>(Lưu trữ CDN hình ảnh & âm thanh)"]
        G_AUTH["🔐 Google OAuth<br/>(Xác thực tài khoản qua Google)"]
    end

    %% Luồng tương tác chính của Người dùng & Admin
    USER -->|Tương tác học tập & Chat AI| MOBILE
    ADMIN -->|Tác vụ quản lý| WEB

    %% Luồng mạng kết nối từ Client
    MOBILE -->|Gửi request & Chat AI| HTTP
    MOBILE -->|Duy trì kết nối thông báo| WS
    WEB -->|Gửi request| HTTP

    %% Định tuyến yêu cầu phía Backend
    HTTP --> SEC_FILTER
    WS --> CTRL_WS

    REPOS_JPA <-->|Đọc / Ghi dữ liệu| DB

    %% Tương tác với dịch vụ bên thứ ba từ Backend (REST API)
    SVC_AI <-->|Đàm thoại AI (HTTP REST)| GEMINI
    SVC_BIZ <-->|Tải & Nhận file URL| CLOUDINARY
    SVC_BIZ <-->|Yêu cầu xác minh token| G_AUTH

    %% Kết nối WebSocket đẩy dữ liệu về và liên kết thông báo đến người dùng
    CTRL_WS -.->|Đẩy thông báo thời gian thực| MOBILE
    EXPO_NOTIF -.->|Hiển thị Banner Thông báo| USER
```

---

## 3. Giải thích vai trò của từng khối trong hệ thống

| Khối thành phần | Vai trò & Chức năng chính | Công nghệ cốt lõi |
| :--- | :--- | :--- |
| **Giao diện di động (Mobile App)** | Nơi học viên học tập từ vựng, ôn tập bằng flashcard, chơi game, và gửi câu hỏi trò chuyện trực tiếp với trợ lý AI qua giao thức HTTP REST thông thường. | React Native (Expo), TypeScript |
| **Expo Notifications (Local Push)** | Tiếp nhận yêu cầu kích hoạt thông báo từ ứng dụng di động khi có bản tin đẩy về từ cổng WebSocket của Server, trực tiếp hiển thị banner thông báo tới màn hình điện thoại người dùng. | Expo Notifications API |
| **Trang quản trị (Admin Dashboard)** | Giao diện chạy trên nền web cho phép quản trị viên xem các báo cáo số liệu, quản lý và cập nhật ngân hàng câu hỏi, bài học và cơ sở dữ liệu từ vựng. | React.js (Vite), TypeScript |
| **Lớp Giao tiếp và Mạng (Network Layer)** | HTTP REST đảm nhận tất cả các tương tác đồng bộ dữ liệu nghiệp vụ và **cả luồng trò chuyện với AI**. WebSocket STOMP **chỉ đảm nhận nhiệm vụ duy nhất là đẩy thông báo thời gian thực** từ máy chủ về thiết bị. | Axios, @stomp/stompjs |
| **Bộ lọc Bảo mật (Security & Filter)** | Thực hiện kiểm tra định danh người dùng qua mã JWT, phân quyền truy cập tài nguyên (Role-Based Access Control) và cấu hình CORS để bảo vệ các API endpoint khỏi các cuộc tấn công bên ngoài. | Spring Security, JJWT |
| **Bộ điều khiển API & WS Broker** | Tiếp nhận các yêu cầu REST API và các bản tin WebSocket kết nối thiết bị từ Client, kiểm tra tính hợp lệ của tham số đầu vào (validation) và chuyển tiếp yêu cầu đến lớp nghiệp vụ tương ứng. | `@RestController`, `@MessageMapping` |
| **Lớp xử lý nghiệp vụ (Business Logic)** | Chứa các nghiệp vụ lõi: Thuật toán lặp ngắt quãng (Spaced Repetition), tính toán kết quả trắc nghiệm, tổng hợp thống kê hoạt động, điều phối Prompt gửi tới Gemini AI qua REST, và lập lịch quét thông báo cần gửi. | Spring Service, Spring Scheduler |
| **Lớp truy xuất dữ liệu (Data Access)** | Cung cấp các phương thức thao tác với cơ sở dữ liệu quan hệ một cách an toàn và tối ưu, giảm thiểu mã SQL thuần túy bằng các cơ chế ánh xạ thực thể quan hệ (ORM). | Spring Data JPA, Hibernate |
| **Cơ sở dữ liệu (Database)** | Lưu trữ bền vững dữ liệu của hệ thống, bao gồm thông tin tài khoản học viên, ngân hàng từ vựng và bài học, tiến trình học tập, lịch sử chat AI và nhật ký hoạt động. Bảng `DeviceToken` lưu động phiên kết nối socket. | MySQL 8.0 |
| **Dịch vụ AI và Đám mây (External Services)** | Cung cấp các tính năng thông minh và tối ưu hóa tài nguyên: Google Gemini hỗ trợ giải đáp thắc mắc học tập, Cloudinary tối ưu hóa tốc độ tải ảnh/âm thanh từ vựng, Google OAuth hỗ trợ đăng nhập nhanh, và Expo Notifications điều phối thông báo cục bộ. | Gemini API, Cloudinary SDK, Google OAuth2 |

---

## 4. Luồng xử lý dữ liệu chính của hệ thống (Data Flow)

### 4.1. Luồng học tập và gửi kết quả bài học
```
Học viên mở bài học (Mobile) 
  ↳ Gửi request GET /api/lessons/{id} qua HTTP REST
  ↳ Backend tiếp nhận -> Security Filter (Kiểm tra JWT hợp lệ)
  ↳ LessonService + WordRepository truy vấn cơ sở dữ liệu MySQL để lấy danh sách từ vựng & câu hỏi
  ↳ Phản hồi dữ liệu JSON về thiết bị di động
Học viên làm bài tập & nộp bài
  ↳ Gửi request POST /api/lessons/{id}/submit kèm đáp án qua HTTP REST
  ↳ QuizService chấm điểm, tính toán tỷ lệ hoàn thành
  ↳ Lưu tiến trình (UserLessonProgress) & cập nhật điểm số (Statistics) vào MySQL
  ↳ Trả kết quả điểm số & đánh giá về màn hình Mobile
```

### 4.2. Luồng hỏi đáp trợ lý ảo (AI Chatbot) - Hoàn toàn qua HTTP/REST
```
Học viên gửi câu hỏi yêu cầu giải nghĩa từ vựng
  ↳ Gửi request POST /api/chat-sessions/{sessionId}/messages qua HTTP REST (không dùng WebSocket)
  ↳ ChatService tiếp nhận, lưu câu hỏi của người học vào bảng Message trong MySQL
  ↳ Đóng gói prompt và gọi REST API đồng bộ đến Google Gemini AI
  ↳ Nhận phản hồi văn bản từ Gemini AI
  ↳ MessageService lưu câu trả lời của AI vào MySQL
  ↳ Trả kết quả phản hồi về Client hiển thị lên khung chat di động
```

### 4.3. Luồng gửi thông báo nhắc nhở học tập thời gian thực (WebSocket)
```
SchedulerService tự động kích hoạt hàng ngày trên Backend (hoặc khi người dùng đạt Achievement)
  ↳ Quét các học viên cần gửi thông báo nhắc nhở hoặc chúc mừng
  ↳ Gọi NotificationService.sendToUser(userId, title, body, data)
  ↳ Đẩy gói tin thông báo qua WebSocket (STOMP broker) tới kênh đăng ký của người dùng
  ↳ Mobile Client nhận được message qua socket đang duy trì trực tiếp
  ↳ Gọi hàm hiển thị thông báo của Expo Notifications API
  ↳ Hiển thị Banner thông báo đẩy (Push notification banner) lên màn hình của Học viên
```

---

## 5. Phân tích chi tiết cơ chế hoạt động của WebSocket và Quản lý Thông báo

Cơ chế truyền thông thời gian thực bằng WebSocket được thiết kế phục vụ mục đích duy nhất là đẩy thông báo nhắc nhở học tập và đồng bộ trạng thái trực tiếp:

### 5.1. Mô hình kết nối và Giao thức truyền thông
```
[React Native Client] ──── Raw WebSocket ────> [Spring Boot Broker]
        │                                             │
        ├── (1) Đăng nhập & kết nối WebSocket         │
        │   URL: /ws/notifications/websocket          │
        │                                             │
        ├── (2) Đăng ký thiết bị (Register Device)     │
        │   Kênh: /app/register-device                │
        │   Payload: { userId, platform }             │
        │                                             ├─> Lưu Session ID vào MySQL
        │                                             │   (Bảng DeviceToken)
        ├── (3) Đăng ký nhận tin cá nhân (Subscribe)  │
        │   Kênh: /user/queue/notifications           │
        │                                             │
        │<─── (4) Server đẩy thông báo cá nhân ───────┤
        │   Kênh: /user/{userId}/queue/notifications  │
        │                                             │
        └── (5) Nhận tin STOMP -> Gọi Expo Notif ─────┘
            Kích hoạt Local Push Banner trên thiết bị
```

* **Giao tiếp STOMP**: Backend sử dụng Spring Boot với cấu hình `@EnableWebSocketMessageBroker` để làm Broker điều phối tin nhắn. Hệ thống đăng ký hai prefix giao tiếp chính: `/app` cho các tin nhắn từ Client gửi lên Server và `/user` (kết hợp `/topic` và `/queue`) cho tin nhắn Server gửi xuống các Client cụ thể.
* **Tối ưu hóa cho React Native**: Mặc dù backend hỗ trợ SockJS (`/ws/notifications`), nhưng trên môi trường di động React Native, thư viện SockJS thường gặp các lỗi tương thích về cookie và phiên kết nối. Do đó, Mobile Client sử dụng thư viện `@stomp/stompjs` và thiết lập một `webSocketFactory` tùy chỉnh để kết nối trực tiếp bằng **Raw WebSocket** đến đường dẫn `/ws/notifications/websocket` (thay thế cho SockJS endpoint thông thường `/ws/notifications`).

### 5.2. Quản lý Vòng đời Phiên kết nối và Định danh Thiết bị (Device Mapping)
Để đảm bảo thông báo gửi đúng người dùng và không lãng phí tài nguyên mạng khi người dùng ngoại tuyến (offline), hệ thống quản lý các phiên kết nối thông qua bảng `DeviceToken` trong cơ sở dữ liệu:
* **Khi kết nối thành công (`SessionConnectEvent`)**: Client gửi một frame đăng ký lên destination `/app/register-device` mang thông tin định danh của người dùng (`userId`) và hệ điều hành (`platform` như `IOS`, `ANDROID` hoặc `WEB`).
* **Lưu thông tin phiên (Mapping)**: Lớp xử lý `WebSocketEventHandler` trên Spring Boot đón nhận tin nhắn, trích xuất `sessionId` duy nhất của socket và tiến hành lưu hoặc cập nhật bản ghi vào cơ sở dữ liệu MySQL dưới dạng `DeviceToken`. Lúc này, `socketSessionId` và `token` của thiết bị được liên kết trực tiếp với ID người dùng.
* **Khi ngắt kết nối (`SessionDisconnectEvent`)**: Khi người dùng đóng ứng dụng hoặc mất kết nối mạng, sự kiện ngắt kết nối được kích hoạt trên Spring Boot. `WebSocketEventHandler` tự động thực hiện truy vấn xóa bản ghi thiết bị tương ứng khỏi bảng `DeviceToken` (`deviceTokenRepository.deleteBySocketSessionId(sessionId)`). Điều này đảm bảo tính toàn vẹn của danh sách phiên kết nối hoạt động.

### 5.3. Quy trình gửi và phân phối thông báo thời gian thực
Khi một sự kiện như nhắc nhở học tập (`STUDY_REMINDER`), duy trì chuỗi liên tục (`STREAK_REMINDER`), hoàn thành mục tiêu (`ACHIEVEMENT`), hoặc cập nhật từ vựng mới (`NEW_VOCABULARY`) xảy ra:
1. **Yêu cầu phân phối**: Backend gọi `NotificationService.sendToUser(userId, title, body, data)`.
2. **Định tuyến tin nhắn**: `NotificationServiceImpl` sử dụng `SimpMessagingTemplate.convertAndSendToUser` đẩy dữ liệu đến destination `/queue/notifications`. Spring Broker sẽ tự động phân phối tin nhắn đến các socket session đang hoạt động của người dùng đó (đã đăng ký kênh `/user/queue/notifications`).
3. **Kích hoạt cục bộ (Local Push)**: Khi Client nhận được message, hàm callback `handleNotificationMessage` trích xuất các trường dữ liệu tiêu đề và nội dung. Sau đó, nó gọi dịch vụ `showLocalNotification` của thiết bị di động, sử dụng thư viện `expo-notifications` để kích hoạt thông báo đẩy cục bộ (`Notifications.scheduleNotificationAsync` với `trigger: null`), hiển thị banner thông báo sinh động lên màn hình điện thoại của người dùng mà không cần phải đi qua cổng trung gian Firebase Cloud Messaging (FCM).
