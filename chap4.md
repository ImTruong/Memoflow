# CHƯƠNG 4: TRIỂN KHAI HỆ THỐNG

## 4.1. Mô hình triển khai hệ thống (Deployment Diagram)

Khác với kiến trúc logic (chỉ tả luồng nghiệp vụ giữa các lớp đối tượng bên trong phần mềm), **Mô hình triển khai vật lý (Physical Deployment Diagram)** dưới đây mô tả cách thức đóng gói các dịch vụ của Memoflow dưới dạng container, phân bổ cổng mạng (ports) và cơ chế lưu trữ dữ liệu (volumes/bind mounts) trên hạ tầng Docker:

```mermaid
flowchart TD
    subgraph ClientHost["Thiết bị Client"]
        Browser["Web Browser (Admin Dashboard)"]
        MobileApp["Mobile App (Expo Go / Android / iOS)"]
    end

    subgraph HostMachine["Docker Host (Máy chủ / Máy cá nhân chạy Docker)"]
        subgraph Ports["Cổng kết nối vật lý (Host Ports)"]
            HostPort8081["Port 8081 (Admin Web)"]
            HostPort8080["Port 8080 (API Backend)"]
            HostPort3306["Port 3306 (MySQL DB)"]
        end

        subgraph DockerNet["Docker Network (memoflow_default)"]
            MySQL["MySQL Container (memoflow-mysql) \n- Image: mysql:8.0 \n- Cổng nội bộ: 3306"]
            Backend["Spring Boot Backend Container (memoflow-backend) \n- JRE 17 (Eclipse Temurin) \n- Cổng nội bộ: 8080"]
            Admin["React Admin Container (memoflow-admin) \n- Nginx Alpine \n- Cổng nội bộ: 80"]
        end

        subgraph Volumes["Lưu trữ dữ liệu vật lý (Host Storage)"]
            DBVolume["Volume: mysql_data \n(Persistent MySQL Data)"]
            ModelDir["Thư mục: ./models/ \n(Chứa file Word2Vec *.bin)"]
        end
    end

    %% Client kết nối tới cổng vật lý
    Browser -->|HTTP - Cổng 8081| HostPort8081
    Browser -->|API Requests - Cổng 8080| HostPort8080
    MobileApp -->|HTTP / WebSockets - Cổng 8080| HostPort8080

    %% Cổng vật lý định tuyến vào Container
    HostPort8081 <-->|Port Forwarding: 8081->80| Admin
    HostPort8080 <-->|Port Forwarding: 8080->8080| Backend
    HostPort3306 <-->|Port Forwarding: 3306->3306| MySQL

    %% Liên kết dữ liệu & Network nội bộ
    Backend -->|Kết nối DB nội bộ: mysql:3306| MySQL
    DBVolume <-->|Volume Mount: /var/lib/mysql| MySQL
    ModelDir -.->|Bind Mount: /app/models| Backend

    classDef container fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef volume fill:#efebe9,stroke:#4e342e,stroke-width:2px;
  ### Mô tả cơ chế hoạt động của mô hình triển khai:
1. **Network Cô Lập (Docker Network):** Ba container (`memoflow-mysql`, `memoflow-backend`, `memoflow-admin`) được đặt chung trong một mạng ảo nội bộ để giao tiếp an sau và nhanh chóng thông qua Service Name (ví dụ: Backend gọi Database qua `jdbc:mysql://mysql:3306/memoflow`).
2. **Decouple Word2Vec Model (Tách biệt Model nặng):** 
   Do file model Word2Vec (`GoogleNews-vectors-negative300-SLIM.bin`) có dung lượng lớn (~1.5 GB), việc đóng gói trực tiếp vào Docker Image sẽ làm tăng kích thước image lên mức không thể chấp nhận được. Hệ thống giải quyết bằng cách áp dụng **Bind Mount Volume** từ thư mục `./models` trên máy host vào `/app/models` trong Container. Điều này giữ Docker Image của Backend luôn nhẹ gọn (~250MB) và dễ phân phối.
3. **Data Persistence:** Phân vùng lưu trữ cơ sở dữ liệu được map vào ổ cứng máy host thông qua Docker volume named `mysql_data` để đảm bảo dữ liệu không bị mất khi dừng hoặc restart container.
4. **Triển khai Mobile App ngoài Docker:**
   Ứng dụng di động (Mobile App) được phát triển bằng React Native & Expo Go. Thành phần này **không chạy trong Docker** mà được khởi chạy trực tiếp trên máy host qua môi trường Node.js. Quyết định này giúp lập trình viên/người dùng có thể quét mã QR bằng điện thoại cá nhân (để mở qua app Expo Go) hoặc chạy qua Emulator/Simulator. Thiết bị di động sẽ giao tiếp với Backend Container thông qua cổng `8080` của máy Host bằng địa chỉ IP mạng nội bộ (mạng LAN/Wi-Fi chung).

---

## 4.2. Quy trình cài đặt và triển khai

### 4.2.1. Yêu cầu môi trường

Để cài đặt và chạy toàn bộ hệ thống Memoflow, thiết bị triển khai cần đáp ứng các điều kiện sau:

*   **Hệ điều hành:** macOS, Linux hoặc Windows 10/11 (hỗ trợ WSL2).
*   **Phần mềm yêu cầu:**
    *   **Docker Desktop** (hoặc Docker Engine & Docker Compose phiên bản v2.0 trở lên).
    *   **Node.js (v18 trở lên)** và **npm** để chạy ứng dụng Mobile.
    *   Ứng dụng **Expo Go** đã được cài đặt sẵn trên điện thoại di động (Android / iOS).
    *   **Git** để clone mã nguồn.
*   **Yêu cầu tài nguyên tối thiểu:**
    *   **RAM trống:** Tối thiểu **6GB - 8GB** (Spring Boot chiếm ~1GB, MySQL chiếm ~500MB, và thư viện DeepLearning4J khi nạp model Word2Vec cần tối thiểu khoảng **4GB RAM** để ánh xạ các véc-tơ từ).

---

### 4.2.2. Các bước cài đặt

#### Bước 1: Clone dự án
Mở Terminal/Command Prompt và tải mã nguồn dự án từ repository:
```bash
git clone <URL_REPOS_MEMOFLOW>
cd Memoflow
```

#### Bước 2: Tải và thiết lập Word2Vec Model
1. Tải tệp mô hình Word2Vec đã thu gọn (SLIM) từ các nguồn mở hoặc link Google Drive dự phòng của nhóm:
   * **Tên file yêu cầu:** `GoogleNews-vectors-negative300-SLIM.bin`
2. Tạo thư mục tên là `models` tại thư mục gốc của dự án (nằm cùng cấp với file `docker-compose.yml`):
   ```bash
   mkdir models
   ```
3. Di chuyển hoặc sao chép file mô hình đã tải vào thư mục này:
   ```bash
   # Cấu trúc thư mục mong muốn sau khi copy:
   Memoflow/
   ├── models/
   │   └── GoogleNews-vectors-negative300-SLIM.bin
   ├── BackEnd/
   ├── FrontEnd/
   └── docker-compose.yml
   ```

#### Bước 3: Khởi tạo tệp cấu hình môi trường (.env)
1. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
2. Mở file `.env` và kiểm tra/chỉnh sửa cấu hình nếu cần (mặc định đã được thiết lập tối ưu cho môi trường local chạy localhost):
   * `DB_ROOT_PASSWORD`: Mật khẩu root của MySQL.
   * `SPRING_SQL_INIT_MODE`: Đặt là `always` trong lần chạy đầu tiên để nạp dữ liệu mẫu (`data.sql`), đổi thành `never` ở các lần chạy sau để tránh ghi đè dữ liệu.
   * `VITE_API_URL`: Địa chỉ API của Backend (mặc định là `http://localhost:8080`).

---

### 4.2.3. Các bước chạy hệ thống Docker (Database, Backend, Admin Web)

#### Bước 1: Build và khởi động các Container
Thực hiện lệnh sau tại thư mục gốc của dự án để tải thư viện, biên dịch ứng dụng và khởi chạy các dịch vụ chạy ngầm:
```bash
docker compose up -d --build
```

#### Bước 2: Theo dõi quá trình khởi chạy & nạp dữ liệu (Seeding)
Hệ thống sẽ mất từ 30s - 1 phút ở lần khởi chạy đầu tiên để tạo các bảng cơ sở dữ liệu, chạy script `data.sql` và load model Word2Vec vào RAM. Kiểm tra trạng thái bằng lệnh:
```bash
docker compose logs -f backend
```
Khi màn hình xuất hiện thông báo sau, hệ thống đã sẵn sàng:
```text
Tomcat started on port 8080 (http) with context path '/'
Started MemoflowApplication in XX.XXX seconds
```

#### Bước 3: Truy cập và kiểm thử ứng dụng Web
*   **Giao diện Quản trị viên (Admin Web Dashboard):** Truy cập địa chỉ [http://localhost:8081](http://localhost:8081)
*   **Địa chỉ API Backend:** [http://localhost:8080](http://localhost:8080)
*   **Tài khoản Test mặc định (Đã có sẵn dữ liệu mẫu):**
    *   *Tài khoản Admin:* Email: `admin@example.com` / Mật khẩu: `123456`
    *   *Tài khoản Học viên:* Email: `testuser@example.com` / Mật khẩu: `123456`

#### Bước 4: Dừng và tắt các Container khi hoàn tất
Khi muốn dừng hệ thống mà vẫn giữ nguyên dữ liệu trong DB, chạy lệnh:
```bash
docker compose down
```
Nếu muốn xóa sạch container và dữ liệu để chạy lại từ đầu, thêm cờ `-v`:
```bash
docker compose down -v
```

---

### 4.2.4. Quy trình khởi chạy tự động hóa bằng Script (Khuyên dùng)

Để đơn giản hóa việc triển khai cho lập trình viên và người dùng chạy thử nghiệm, dự án cung cấp một kịch bản khởi chạy tự động mang tên `run_app.sh` đặt tại thư mục gốc. Script này sẽ tự động thực hiện các nhiệm vụ sau:
1. Dò tìm địa chỉ IP mạng LAN/Wi-Fi của máy tính đang chạy.
2. Ghi và cấu hình động địa chỉ IP này vào file `FrontEnd/memoflow/.env` dưới dạng biến môi trường `EXPO_PUBLIC_API_URL` để ứng dụng di động tự động đọc.
3. Kích hoạt toàn bộ các container Docker (Cơ sở dữ liệu MySQL, Spring Boot Backend và React Admin Web Dashboard) chạy nền.
4. Di chuyển vào thư mục Frontend Mobile, kiểm tra cài đặt dependencies (`npm install`) và khởi động Expo Server hiển thị mã QR.

#### Các bước thực hiện:
1. Mở Terminal tại thư mục gốc dự án:
   ```bash
   chmod +x run_app.sh # Cấp quyền thực thi nếu chạy lần đầu
   ./run_app.sh
   ```
2. Đợi Docker Compose khởi động xong, màn hình Terminal sẽ hiển thị mã QR Code lớn của Expo.
3. Kết nối điện thoại di động cá nhân vào **chung mạng Wi-Fi/LAN** với máy tính.
4. Quét mã QR hiển thị để trải nghiệm ứng dụng:
   * **Android:** Sử dụng chức năng quét mã QR trong ứng dụng **Expo Go**.
   * **iOS (iPhone):** Mở ứng dụng **Camera** mặc định, quét mã và đồng ý mở liên kết bằng ứng dụng **Expo Go**.

---

### 4.2.5. Quy trình cấu hình và khởi chạy Mobile App thủ công

Trong trường hợp muốn chạy thủ công từng phần, bạn thực hiện theo các bước sau:

#### Bước 1: Tìm IP máy chủ và cấu hình động cho Mobile
1. Tìm địa chỉ IP LAN nội bộ của máy tính của bạn (Ví dụ: `192.168.1.5`).
2. Tạo file `FrontEnd/memoflow/.env` và thêm biến môi trường sau:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.5:8080
   ```
3. Lúc này, [apiClient.ts](file:///Users/truong/year4semester2/MAD/Memoflow/FrontEnd/memoflow/src/api/apiClient.ts) sẽ tự động nạp Endpoint này thông qua biến môi trường của Expo:
   ```typescript
   export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
   ```

#### Bước 2: Cài đặt thư viện và khởi chạy
1. Di chuyển vào thư mục Mobile và cài đặt:
   ```bash
   cd FrontEnd/memoflow
   npm install
   ```
2. Khởi chạy máy chủ phát triển của Expo:
   ```bash
   npx expo start
   ```
3. Quét mã QR code hiển thị trên terminal bằng ứng dụng **Expo Go** trên thiết bị di động (đảm bảo thiết bị di động và máy tính dùng chung mạng Wi-Fi).


