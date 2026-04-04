# Memoflow - Setup Guide

## Prerequisites

- Docker & Docker Compose
- Node.js & npm
- Java 17+
- Xcode (for iOS development)

---

## Backend Setup

### 1. Start MySQL with Docker

```bash
cd /Users/sakai/VIET_Working/STUDY_WORK/Ki8/Mobile/Memoflow
docker compose up -d
```

### 2. Verify MySQL is Running

```bash
docker compose ps
```

Expected output: MySQL container should show status `Up` and `healthy`

### 3. Run Spring Boot Server

```bash
cd BackEnd/memoflow
./mvnw spring-boot:run
```

Expected output:
```
Tomcat started on port 8080 (http) with context path '/'
Started MemoflowApplication in X.X seconds
```

### 4. Verify Backend is Running

```bash
curl http://localhost:8080/actuator/health
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd FrontEnd/memoflow
npm install
```

### 2. Run on iOS Simulator

```bash
npm run ios
```

Expected output:
```
Opening on iPhone 16 Pro (com.anonymous.memoflow)
iOS Bundled XXXX ms index.ts
```

### 3. Reload App (in Expo terminal)

Press `r` to reload the app after code changes

---

## API Configuration

The frontend is configured to connect to `http://localhost:8080`

To change API URL, edit:
```
FrontEnd/memoflow/src/api/apiClient.ts
```

Change `API_BASE_URL` to your backend URL:
```typescript
export const API_BASE_URL = 'http://localhost:8080';
```

---

## Stop Services

### Stop All Containers

```bash
docker compose down
```

### Stop iOS Simulator

Press `Ctrl+C` in the Expo terminal

---

## Common Issues

### MySQL Connection Failed

```bash
# Restart containers
docker compose down -v
docker compose up -d
```

### Network Request Failed on iOS

Make sure backend is running on `localhost:8080` and update `apiClient.ts` with correct IP

### Expo Build Errors

```bash
cd FrontEnd/memoflow
rm -rf node_modules package-lock.json
npm install
npm run ios
```

---

## Project Structure

```
Memoflow/
├── BackEnd/memoflow/          # Spring Boot API
│   ├── src/main/java/         # Java source code
│   ├── pom.xml                # Maven configuration
│   └── Dockerfile             # Docker build
├── FrontEnd/memoflow/         # React Native (Expo)
│   ├── src/                   # TypeScript source
│   ├── app.json               # Expo config
│   └── package.json           # Dependencies
└── docker-compose.yml          # Docker services
```

---

## Default Credentials

- **Database**: memoflow
- **Root User**: root
- **Password**: 12345678
- **Port**: 3306

---

## API Endpoints

- Health Check: `GET http://localhost:8080/actuator/health`
- User Profile: `GET http://localhost:8080/users/profile`
- Flashcard Lessons: `GET http://localhost:8080/flashcard-lessons/my`
- Daily Stats: `GET http://localhost:8080/flashcard-reviews/daily-stats`

---

## Notes

- Backend runs on port `8080`
- Frontend (Expo) runs on port `8081`
- MySQL runs on port `3306`
- All services communicate through Docker network
