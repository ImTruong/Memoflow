# Sequence Diagram - Quản lý Thông tin Cá nhân (Use Case 3.4.1)

Sequence Diagram cho Use Case "Quản lý Thông tin Cá nhân" (Personal Information Management) với các tương tác chính:
- Đăng nhập (Login) [INCLUDE]
- Xem Thông tin Cá nhân (View Profile)
- Chỉnh sửa Thông tin Cá nhân (Edit Profile) [EXTEND]
- Chỉnh sửa Chế độ Nhận Thông báo (Edit Notification Settings) [EXTEND]
- Đổi Mật khẩu (Change Password) [EXTEND]

## 1. Use Case: Đăng nhập (Login) - INCLUDE

> NOTE: Đăng nhập là bắt buộc cho "Quản lý thông tin cá nhân" nhưng chi tiết quy trình đăng nhập được bỏ qua ở đây. Các luồng sau giả định người dùng đã xác thực và có JWT token hợp lệ trong header Authorization.

```mermaid
sequenceDiagram
    participant Client as 📱 Client (Authenticated)
    note right of Client: JWT token present
    %% Login sequence intentionally omitted to focus on profile management flows
```


---

## 2. Use Case: Xem Thông tin Cá nhân (View Profile)

```mermaid
sequenceDiagram
    actor User as 👤 User/Actor
    participant FrontEnd as 📱 ProfileScreen
    participant ApiClient as 🔌 API Client
    participant UserCtrl as 🎯 UserController
    participant UserSvc as ⚙️ UserService
    participant UserRepo as 📦 UserRepository
    participant Database as 💾 MySQL Database

    User->>FrontEnd: Mở "Trang cá nhân"
    FrontEnd->>ApiClient: getProfile()
    ApiClient->>UserCtrl: GET /users/profile

    UserCtrl->>UserSvc: getUserProfile(request)
    UserSvc->>UserRepo: findById(userId)
    UserRepo->>Database: SELECT * FROM User WHERE id = ?
    Database-->>UserRepo: User Entity {id, name, email, avatar, dateOfBirth, ...}
    UserRepo-->>UserSvc: User Object

    UserSvc->>UserCtrl: UserResponse {name, email, avatar, dateOfBirth}
    UserCtrl-->>ApiClient: 200 OK {UserResponse}
    ApiClient-->>FrontEnd: Profile Data
    FrontEnd->>FrontEnd: Update State & Render Profile UI
    FrontEnd-->>User: ✅ Hiển thị thông tin cá nhân
```

---

## 3. Use Case: Chỉnh sửa Thông tin Cá nhân (Edit Profile) [EXTEND]

```mermaid
sequenceDiagram
    actor User as 👤 User/Actor
    participant FrontEnd as 📱 EditProfileScreen
    participant ImagePicker as 📷 ImagePicker
    participant ApiClient as 🔌 API Client
    participant UserCtrl as 🎯 UserController
    participant UserSvc as ⚙️ UserService
    participant CloudinaryService as ☁️ CloudinaryService
    participant Cloudinary as 🖼️ Cloudinary CDN
    participant UserRepo as 📦 UserRepository
    participant Database as 💾 MySQL Database

    User->>FrontEnd: Click "Chỉnh sửa thông tin"
    FrontEnd->>FrontEnd: Load Current Profile Data

    User->>FrontEnd: Thay đổi Tên/Email/Ngày sinh

    alt Nếu thay đổi ảnh đại diện
        User->>FrontEnd: Chọn ảnh mới
        FrontEnd->>ImagePicker: requestPermission()
        ImagePicker-->>FrontEnd: Permission Granted
        FrontEnd->>ImagePicker: launch()
        ImagePicker-->>FrontEnd: Image URI {size, type, ...}
        FrontEnd->>FrontEnd: Compress & Update Avatar Preview
    end

    FrontEnd->>FrontEnd: Validate Input
    User->>FrontEnd: Click "Lưu"

    FrontEnd->>ApiClient: updateProfile(formData)
    ApiClient->>UserCtrl: PUT /users/profile (FormData)

    UserCtrl->>UserSvc: updateProfile(request)
    alt Nếu có ảnh mới
        UserSvc->>CloudinaryService: uploadImage(file)
        CloudinaryService->>Cloudinary: POST /upload
        Cloudinary-->>CloudinaryService: {url, publicId}
        CloudinaryService-->>UserSvc: Image URL
        UserSvc->>UserSvc: Update avatar URL
    end

    UserSvc->>UserRepo: save(updatedUser)
    UserRepo->>Database: UPDATE User SET name=?, email=?, avatar=?, dateOfBirth=? WHERE id=?
    Database-->>UserRepo: Success
    UserRepo-->>UserSvc: Updated User Entity

    UserSvc-->>UserCtrl: UserResponse (updated)
    UserCtrl-->>ApiClient: 200 OK {UserResponse}
    ApiClient-->>FrontEnd: Profile Updated
    FrontEnd->>FrontEnd: Update cached profile & Show Toast
    FrontEnd-->>User: ✅ Cập nhật thành công
```

---

## 4. Use Case: Chỉnh sửa Chế độ Nhận Thông báo (Edit Notification Settings) [EXTEND]

```mermaid
sequenceDiagram
    actor User as 👤 User/Actor
    participant FrontEnd as 📱 NotificationSettingsScreen
    participant ApiClient as 🔌 API Client
    participant SettingCtrl as 🎯 SettingController
    participant SettingSvc as ⚙️ SettingService
    participant SettingRepo as 📦 SettingRepository
    participant Database as 💾 MySQL Database

    User->>FrontEnd: Mở "Cài đặt thông báo"
    FrontEnd->>ApiClient: getSettings()
    ApiClient->>SettingCtrl: GET /settings

    SettingCtrl->>SettingSvc: getSettings(request)
    SettingSvc->>SettingRepo: findByUserId(userId)
    SettingRepo->>Database: SELECT * FROM Setting WHERE userId = ?
    Database-->>SettingRepo: Setting Entity
    SettingRepo-->>SettingSvc: Setting Object

    SettingSvc-->>SettingCtrl: SettingResponse
    SettingCtrl-->>ApiClient: 200 OK {SettingResponse}
    ApiClient-->>FrontEnd: Current Settings
    FrontEnd->>FrontEnd: Display Toggles

    User->>FrontEnd: Toggle preferences
    FrontEnd->>ApiClient: updateSettings(payload)
    ApiClient->>SettingCtrl: PUT /settings

    SettingCtrl->>SettingSvc: updateSettings(request)
    SettingSvc->>SettingRepo: save(updatedSetting)
    SettingRepo->>Database: UPDATE Setting ... WHERE userId=?
    Database-->>SettingRepo: Success
    SettingRepo-->>SettingSvc: Updated Setting Entity

    SettingSvc-->>SettingCtrl: SettingResponse (updated)
    SettingCtrl-->>ApiClient: 200 OK {SettingResponse}
    ApiClient-->>FrontEnd: Settings Saved
    FrontEnd->>FrontEnd: Show Toast: "Cài đặt đã được lưu!"
    FrontEnd-->>User: ✅ Cài đặt thông báo cập nhật
```

---

## 5. Use Case: Đổi Mật khẩu (Change Password) [EXTEND]

```mermaid
sequenceDiagram
    actor User as 👤 User/Actor
    participant FrontEnd as 📱 ChangePasswordScreen
    participant ApiClient as 🔌 API Client
    participant UserCtrl as 🎯 UserController
    participant UserSvc as ⚙️ UserService
    participant PasswordEncoder as 🔐 BCryptPasswordEncoder
    participant UserRepo as 📦 UserRepository
    participant Database as 💾 MySQL Database

    User->>FrontEnd: Mở "Đổi mật khẩu"
    User->>FrontEnd: Nhập Mật khẩu hiện tại / Mật khẩu mới / Xác nhận
    FrontEnd->>FrontEnd: Validate input

    alt Validation Failed
        FrontEnd-->>User: ❌ Lỗi: Mật khẩu không hợp lệ
    else Validation Success
        FrontEnd->>ApiClient: changePassword(oldPassword, newPassword)
        ApiClient->>UserCtrl: POST /users/change-password

        UserCtrl->>UserSvc: changePassword(request)
        UserSvc->>UserRepo: findById(userId)
        UserRepo->>Database: SELECT * FROM User WHERE id = ?
        Database-->>UserRepo: User Entity (with hashed password)
        UserRepo-->>UserSvc: User Object

        UserSvc->>PasswordEncoder: matches(oldPassword, user.hashedPassword)
        PasswordEncoder-->>UserSvc: true/false

        alt Old Password Mismatch
            UserSvc-->>UserCtrl: throw InvalidPasswordException
            UserCtrl-->>ApiClient: 401 Unauthorized
            ApiClient-->>FrontEnd: Error
            FrontEnd-->>User: ❌ Mật khẩu hiện tại không đúng
        else Old Password Match
            UserSvc->>PasswordEncoder: encode(newPassword)
            PasswordEncoder-->>UserSvc: hashedNewPassword
            UserSvc->>UserRepo: save(user with new password)
            UserRepo->>Database: UPDATE User SET password = ? WHERE id = ?
            Database-->>UserRepo: Success
            UserRepo-->>UserSvc: Updated User Entity

            UserSvc-->>UserCtrl: Success
            UserCtrl-->>ApiClient: 200 OK
            ApiClient-->>FrontEnd: Password Changed Successfully
            FrontEnd->>FrontEnd: Show Toast: "Đổi mật khẩu thành công!"
            FrontEnd-->>User: ✅ Mật khẩu đã được đổi
        end
    end
```

---

## 6. Complete Flow: Quản lý Thông tin Cá nhân (Full Use Case)

```mermaid
sequenceDiagram
    actor User as 👤 User/Actor
    participant App as 📱 App (Navigation)
    participant LoginScr as 📱 LoginScreen
    participant ProfileScr as 📱 ProfileScreen
    participant EditScr as 📱 EditProfileScreen
    participant NotifScr as 📱 NotificationSettingsScreen
    participant ChgPwdScr as 📱 ChangePasswordScreen
    participant Storage as 💾 AsyncStorage
    participant API as 🔌 API Client
    participant Backend as 🖥️ Backend Services

    User->>App: Khởi động App
    App->>Storage: getItem('authToken')
    
    alt Token Exists & Valid
        App-->>ProfileScr: Chuyển hướng
    else Token Not Found or Expired
        App-->>LoginScr: Chuyển hướng
        
        User->>LoginScr: Login Flow
        LoginScr->>API: POST /auth/login
        API->>Backend: Authenticate User
        Backend-->>API: JWT Token
        API-->>LoginScr: Token + User Info
        LoginScr->>Storage: Save Token
        LoginScr-->>App: Navigation Success
        App-->>ProfileScr: Chuyển hướng
    end
    
    User->>ProfileScr: Xem Trang cá nhân
    ProfileScr->>API: GET /users/profile
    API->>Backend: Fetch Profile (JWT Authorized)
    Backend-->>API: User Data
    API-->>ProfileScr: Display Profile
    
    rect rgb(200, 220, 255)
        note over ProfileScr,ChgPwdScr: EXTEND: Các tùy chọn quản lý tài khoản
    end
    
    alt User clicks "Chỉnh sửa"
        User->>EditScr: Chỉnh sửa thông tin
        EditScr->>API: PUT /users/profile
        API->>Backend: Update Profile
        Backend-->>API: Updated User Data
        API-->>EditScr: Success
        EditScr-->>ProfileScr: Quay lại
    else User clicks "Cài đặt thông báo"
        User->>NotifScr: Chỉnh sửa chế độ nhận thông báo
        NotifScr->>API: GET /settings
        API->>Backend: Fetch Settings
        Backend-->>API: Current Settings
        API-->>NotifScr: Display Settings
        
        User->>NotifScr: Toggle các tùy chọn
        NotifScr->>API: PUT /settings
        API->>Backend: Update Settings
        Backend-->>API: Updated Settings
        API-->>NotifScr: Success
        NotifScr-->>ProfileScr: Quay lại
    else User clicks "Đổi mật khẩu"
        User->>ChgPwdScr: Đổi mật khẩu
        ChgPwdScr->>API: POST /users/change-password
        API->>Backend: Verify Old + Set New Password
        Backend-->>API: Success
        API-->>ChgPwdScr: Password Changed
        ChgPwdScr->>Storage: Clear Token (Force Re-login)
        ChgPwdScr-->>LoginScr: Chuyển hướng
    end
    
    User->>User: ✅ Quản lý thông tin cá nhân hoàn tất
```

---

## 7. Architecture Components Summary

### Frontend Components (React Native)
| Component | Responsibility |
|-----------|---|
| **LoginScreen** | Handle login/logout, JWT token storage |
| **ProfileScreen** | Display user profile, navigation to management options |
| **EditProfileScreen** | Update personal info, avatar upload |
| **NotificationSettingsScreen** | Toggle notification preferences |
| **ChangePasswordScreen** | Change password with validation |
| **AsyncStorage** | Persist JWT token locally |
| **API Client** | HTTP requests with Authorization header |

### Backend Components (Spring Boot)
| Component | Responsibility |
|-----------|---|
| **AuthController** | Handle login, register, JWT generation |
| **UserController** | Profile operations (GET, PUT) |
| **SettingController** | Notification settings (GET, PUT) |
| **JWT Auth Filter** | Request validation, extract UserPrincipal |
| **AuthService** | Authentication logic, password validation |
| **UserService** | User profile management |
| **SettingService** | Settings management |
| **PasswordEncoder** | BCrypt password hashing/verification |

### Database (MySQL)
| Table | Purpose |
|-------|---------|
| **User** | Store user credentials, profile (id, email, password, name, avatar, dateOfBirth, ...) |
| **Setting** | Store user preferences (id, userId, emailNotification, pushNotification, ...) |

### Security & Authentication
- **JWT Token**: 24-hour expiry, stored in AsyncStorage
- **CORS Filter**: Validates origin
- **JWT Auth Filter**: Validates token signature & expiry
- **Password Hashing**: BCrypt with salt
- **@AuthenticationPrincipal**: Spring Security integration

---

## Data Flow Summary

```
User Action 
  ↓
Frontend Screen (Validation)
  ↓
API Client (HTTP + JWT Token)
  ↓
Backend: JWT Filter (Authorization)
  ↓
Backend: Controller (Request Mapping)
  ↓
Backend: Service (Business Logic)
  ↓
Backend: Repository (Data Access)
  ↓
Database: CRUD Operations
  ↓
Response Flow (DTO Conversion)
  ↓
Frontend: Update State & UI
  ↓
User Sees Result ✅
```

---

**Version**: 1.0  
**Last Updated**: 2026-05-21  
**Compliance**: Enterprise-level Sequence Diagram with Actor, Controller, Service, Repository, Database layers
