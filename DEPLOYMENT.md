# 4.1. Mô hình triển khai hệ thống

```mermaid
flowchart LR
  subgraph UserDevice[Thiết bị người dùng]
    App[Memoflow Mobile App\nReact Native (Expo)]
  end

  subgraph Host[Máy chạy hệ thống (Dev/Server)]
    BE[Backend API\nSpring Boot (Java 17)\nPort: 8080]
    DB[(MySQL 8\nPort: 3306)]
    BE -->|JDBC| DB
  end

  subgraph External[Dịch vụ ngoài (tùy cấu hình)]
    FCM[Firebase Cloud Messaging\nPush Notifications]
    GEM[Google Gemini\nAI Chat]
    CLD[Cloudinary\nMedia Storage]
    OAUTH[Google OAuth\nSocial Login]
    SMTP[SMTP Email\nOTP/Verify]
  end

  App -->|HTTP/REST JSON| BE
  App -.->|STOMP/WebSocket (thông báo realtime)\n(nếu bật)| BE

  BE --> FCM
  BE --> GEM
  BE --> CLD
  BE --> OAUTH
  BE --> SMTP
```

**Ghi chú ngắn:**
- Database và Backend có thể chạy bằng **Docker Compose** (xem `docker-compose.yml`) hoặc chạy Backend trên máy bằng Maven wrapper (`./mvnw`).
- Frontend gọi API theo `API_BASE_URL` và (nếu dùng) URL WebSocket trong source Frontend.

---

# 4.2. Quy trình cài đặt và triển khai

## 4.2.1. Yêu cầu môi trường

**Bắt buộc (chạy local/dev):**
- Docker Desktop + Docker Compose
- Java **17** (Backend)
- Node.js + npm (Frontend)

**Tùy nền tảng chạy app:**
- iOS: Xcode (Simulator)
- Android: Android Studio (Emulator)

**Cổng mặc định:**
- Backend: `8080`
- MySQL: `3306`

## 4.2.2. Các bước cài đặt

1) **Clone / mở project**
- Repo root: `Memoflow/`

2) **Cấu hình URL backend cho Frontend (quan trọng khi chạy trên máy thật/emulator)**
- Sửa `FrontEnd/memoflow/src/api/apiClient.ts` → `API_BASE_URL`
- (Nếu dùng realtime) kiểm tra thêm URL trong `FrontEnd/memoflow/src/hooks/useNotifications.ts`

3) **Khởi tạo MySQL bằng Docker**
```bash
docker compose up -d mysql
```

4) *(Tuỳ chọn)* **Seed dữ liệu**
- Backend đã cấu hình load `data.sql` khi khởi chạy (tuỳ theo cấu hình Spring).
- Nếu bạn muốn tự import thủ công, có thể dùng `docker exec` vào container MySQL và import file `BackEnd/memoflow/src/main/resources/data.sql`.

5) **Cài dependencies cho Frontend**
```bash
cd FrontEnd/memoflow
npm install
```

## 4.2.3. Các bước chạy hệ thống

### Cách A (dev phổ biến): chạy MySQL bằng Docker + chạy Backend bằng Maven

1) **Chạy MySQL**
```bash
docker compose up -d mysql
```

2) **Chạy Backend**
```bash
cd BackEnd/memoflow
./mvnw spring-boot:run
```

3) **Chạy Frontend (Expo dev client)**
```bash
cd FrontEnd/memoflow
npm run ios   # hoặc: npm run android
```

### Cách B: chạy cả Backend + MySQL bằng Docker Compose
```bash
docker compose up -d
```

### Kiểm tra nhanh
- MySQL container ở trạng thái `healthy`:
```bash
docker compose ps
```
- Backend lắng nghe cổng 8080 (tối thiểu trả về HTTP response):
```bash
curl -I http://localhost:8080
```

**Lưu ý mạng (Frontend ↔ Backend):**
- Nếu chạy app trên **thiết bị thật**, `API_BASE_URL` nên là IP LAN của máy chạy Backend (ví dụ `http://<LAN-IP>:8080`).
- Nếu chạy trên **iOS Simulator**, thường dùng được `http://localhost:8080`.
- Nếu chạy trên **Android Emulator**, thường dùng `http://10.0.2.2:8080` thay cho `localhost`.
