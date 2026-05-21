# Sequence Diagram - Quản lý Thông tin Cá nhân (Use Case 3.4.1)

## PlantUML Format - Complete Personal Information Management Flow

---

## Diagram 1: Xem Thông tin Cá nhân (View Profile)

```plantuml
@startuml
actor User as U
participant "ProfileScreen" as PS
participant "API Client" as AC
participant "UserController" as UC
participant "UserService" as US
participant "UserRepository" as UR
database "MySQL Database" as DB

U -> PS: Mở "Trang cá nhân"
activate PS

PS -> AC: getProfile()
activate AC

AC -> UC: GET /users/profile
activate UC

UC -> US: getUserProfile(request)
activate US

US -> UR: findById(userId)
activate UR

UR -> DB: SELECT * FROM User\nWHERE id = ?
activate DB

DB --> UR: User Entity
deactivate DB

UR --> US: User Object
deactivate UR

US -> US: Convert Entity to DTO
US --> UC: UserResponse
deactivate US

UC --> AC: 200 OK + UserResponse
deactivate UC

AC --> PS: Profile Data
deactivate AC

PS -> PS: Update State\n& Render UI
PS --> U: ✅ Hiển thị thông tin cá nhân
deactivate PS

U -> U: Xem: Tên, Email, Avatar,\nNgày sinh, Streak

@enduml
```

---

## Diagram 2: Gộp 3 Use Case EXTEND (Edit Profile + Notification Settings + Change Password)

```plantuml
@startuml
actor User as U
participant "App Screen" as APP
participant "API Client" as AC
participant "UserController" as UC
participant "SettingController" as SC
participant "UserService" as US
participant "SettingService" as SS
participant "PasswordEncoder" as PE
participant "Repository Layer" as RL
participant "Cloudinary" as CD
database "MySQL Database" as DB

== SCENARIO 1: EDIT PROFILE ==

U -> APP: Click "Chỉnh sửa thông tin"
activate APP

APP -> APP: Load Current Data

U -> APP: Thay đổi Tên/Email/Ngày sinh

alt Change Avatar
    U -> APP: Chọn ảnh mới
    APP -> APP: Request Permission\n& Pick Image
    APP -> APP: Compress & Preview
end

U -> APP: Click "Lưu"

APP -> AC: updateProfile(formData)
activate AC

AC -> UC: PUT /users/profile (FormData)
activate UC

UC -> US: updateProfile(request)
activate US

alt Upload Avatar
    US -> CD: uploadImage(file)
    activate CD
    CD --> US: {url, publicId}
    deactivate CD
end

US -> RL: save(updatedUser)
activate RL

RL -> DB: UPDATE User SET\nname=?, email=?, avatar=?,\ndateOfBirth=? WHERE id=?
activate DB

DB --> RL: Success (1 row affected)
deactivate DB

RL --> US: Updated User Entity
deactivate RL

US --> UC: UserResponse (updated)
deactivate US

UC --> AC: 200 OK
deactivate UC

AC --> APP: Profile Updated
deactivate AC

APP -> APP: Show Toast:\n"Cập nhật thành công!"
APP --> U: ✅ Quay về ProfileScreen

== SCENARIO 2: EDIT NOTIFICATION SETTINGS ==

U -> APP: Click "Cài đặt thông báo"
activate APP

APP -> AC: getSettings()
activate AC

AC -> SC: GET /settings
activate SC

SC -> SS: getSettings(request)
activate SS

SS -> RL: findByUserId(userId)
activate RL

RL -> DB: SELECT * FROM Setting\nWHERE userId = ?
activate DB

DB --> RL: Setting Entity
deactivate DB

RL --> SS: Setting Object
deactivate RL

SS --> SC: SettingResponse
deactivate SS

SC --> AC: 200 OK
deactivate SC

AC --> APP: Current Settings
deactivate AC

APP -> APP: Display Toggles:\nEmail, Push, SMS, etc.

U -> APP: Toggle multiple preferences
APP -> APP: Update Local State

U -> APP: Click "Lưu"

APP -> AC: updateSettings(payload)
activate AC

AC -> SC: PUT /settings
activate SC

SC -> SS: updateSettings(request)
activate SS

SS -> RL: save(updatedSetting)
activate RL

RL -> DB: UPDATE Setting SET\nemailNotification=?,\npushNotification=?\nWHERE userId=?
activate DB

DB --> RL: Success
deactivate DB

RL --> SS: Updated Setting Entity
deactivate RL

SS --> SC: SettingResponse (updated)
deactivate SS

SC --> AC: 200 OK
deactivate SC

AC --> APP: Settings Saved
deactivate AC

APP -> APP: Show Toast:\n"Cài đặt đã được lưu!"
APP --> U: ✅ Cài đặt thông báo cập nhật

== SCENARIO 3: CHANGE PASSWORD ==

U -> APP: Click "Đổi mật khẩu"
activate APP

U -> APP: Nhập mật khẩu hiện tại/mới

APP -> APP: Validate Input

alt Validation Fail
    APP --> U: ❌ Lỗi: Mật khẩu không hợp lệ
else Validation Success
    U -> APP: Click "Đổi mật khẩu"
    
    APP -> AC: changePassword(oldPwd, newPwd)
    activate AC
    
    AC -> UC: POST /users/change-password
    activate UC
    
    UC -> US: changePassword(request)
    activate US
    
    US -> RL: findById(userId)
    activate RL
    
    RL -> DB: SELECT * FROM User\nWHERE id = ?
    activate DB
    
    DB --> RL: User Entity (hashed password)
    deactivate DB
    
    RL --> US: User Object
    deactivate RL
    
    US -> PE: matches(oldPassword,\nuser.hashedPassword)
    activate PE
    
    alt Old Password Mismatch
        PE --> US: false
        deactivate PE
        US --> UC: throw InvalidPasswordException
        deactivate US
        UC --> AC: 401 Unauthorized
        deactivate UC
        AC --> APP: Error
        deactivate AC
        APP --> U: ❌ Mật khẩu hiện tại không đúng
    else Old Password Match
        PE --> US: true
        deactivate PE
        
        US -> PE: encode(newPassword)
        activate PE
        PE --> US: hashedNewPassword
        deactivate PE
        
        US -> RL: save(user with new password)
        activate RL
        
        RL -> DB: UPDATE User SET\npassword = ? WHERE id = ?
        activate DB
        
        DB --> RL: Success
        deactivate DB
        
        RL --> US: Updated User Entity
        deactivate RL
        
        US --> UC: Success
        deactivate US
        
        UC --> AC: 200 OK
        deactivate UC
        
        AC --> APP: Password Changed
        deactivate AC
        
        APP -> APP: Show Toast:\n"Đổi mật khẩu thành công!"
        APP --> U: ✅ Mật khẩu đã được đổi
    end
end

deactivate APP

@enduml
```

---

## Diagram 3: Complete Flow - Personal Information Management (All in One)

```plantuml
@startuml

title Quản lý Thông tin Cá nhân - Use Case 3.4.1\nPersonal Information Management Complete Flow

actor User as U
participant "ProfileScreen" as PS
participant "EditScreen" as ES
participant "SettingScreen" as SS_SCR
participant "PasswordScreen" as PS_SCR
participant "API Client" as API
participant "Backend\nControllers" as CTRL
participant "Backend\nServices" as SVC
participant "Repositories" as REPO
database "Database" as DB
participant "Cloudinary" as CDN

== PRECONDITION: User is authenticated ==

U -> PS: Mở "Trang cá nhân"
activate PS

PS -> API: GET /users/profile
activate API
API -> CTRL: Request Profile
activate CTRL
CTRL -> SVC: Fetch User Data
activate SVC
SVC -> REPO: Query User
activate REPO
REPO -> DB: SELECT User
DB --> REPO: User Data
deactivate DB
REPO --> SVC: User Object
deactivate REPO
SVC --> CTRL: UserResponse
deactivate SVC
CTRL --> API: 200 OK
deactivate CTRL
API --> PS: Profile Data
deactivate API

PS --> U: Hiển thị thông tin cá nhân\n(Tên, Email, Avatar, Ngày sinh, ...)

== USER OPTIONS (alt flows) ==

alt Option 1: Edit Profile
    
    U -> ES: Click "Chỉnh sửa"
    activate ES
    ES -> ES: Load Profile Data
    
    U -> ES: Thay đổi Tên/Email/Ngày sinh
    
    alt Change Avatar
        U -> ES: Chọn ảnh mới
        ES -> ES: Pick & Compress Image
    end
    
    U -> ES: Click "Lưu"
    ES -> API: PUT /users/profile
    activate API
    API -> CTRL: Update Profile Request
    activate CTRL
    CTRL -> SVC: processProfileUpdate(data)
    activate SVC
    
    alt Upload Image
        SVC -> CDN: POST /upload
        activate CDN
        CDN --> SVC: Image URL
        deactivate CDN
    end
    
    SVC -> REPO: save(updatedUser)
    activate REPO
    REPO -> DB: UPDATE User Table
    activate DB
    DB --> REPO: Success
    deactivate DB
    REPO --> SVC: Updated Entity
    deactivate REPO
    
    SVC --> CTRL: UserResponse
    deactivate SVC
    CTRL --> API: 200 OK
    deactivate CTRL
    API --> ES: Success
    deactivate API
    
    ES --> U: ✅ Cập nhật thành công
    deactivate ES
    
else Option 2: Edit Notification Settings
    
    U -> SS_SCR: Click "Cài đặt thông báo"
    activate SS_SCR
    
    SS_SCR -> API: GET /settings
    activate API
    API -> CTRL: Fetch Settings
    activate CTRL
    CTRL -> SVC: getSettings(userId)
    activate SVC
    SVC -> REPO: findByUserId
    activate REPO
    REPO -> DB: SELECT Setting
    DB --> REPO: Current Settings
    deactivate DB
    REPO --> SVC: Setting Object
    deactivate REPO
    SVC --> CTRL: SettingResponse
    deactivate SVC
    CTRL --> API: 200 OK
    deactivate CTRL
    API --> SS_SCR: Settings
    deactivate API
    
    SS_SCR --> U: Display Toggles
    U -> SS_SCR: Toggle: Email/Push/SMS
    U -> SS_SCR: Click "Lưu"
    
    SS_SCR -> API: PUT /settings
    activate API
    API -> CTRL: Update Settings
    activate CTRL
    CTRL -> SVC: updateSettings(payload)
    activate SVC
    SVC -> REPO: save(updatedSetting)
    activate REPO
    REPO -> DB: UPDATE Setting Table
    activate DB
    DB --> REPO: Success
    deactivate DB
    REPO --> SVC: Updated Entity
    deactivate REPO
    SVC --> CTRL: SettingResponse
    deactivate SVC
    CTRL --> API: 200 OK
    deactivate CTRL
    API --> SS_SCR: Success
    deactivate API
    
    SS_SCR --> U: ✅ Cài đặt đã được lưu
    deactivate SS_SCR
    
else Option 3: Change Password
    
    U -> PS_SCR: Click "Đổi mật khẩu"
    activate PS_SCR
    
    U -> PS_SCR: Nhập mật khẩu hiện tại/mới
    PS_SCR -> PS_SCR: Validate Input
    
    alt Validation Error
        PS_SCR --> U: ❌ Mật khẩu không hợp lệ
    else Valid
        U -> PS_SCR: Click "Đổi"
        
        PS_SCR -> API: POST /users/change-password
        activate API
        API -> CTRL: Change Password Request
        activate CTRL
        CTRL -> SVC: verify & updatePassword
        activate SVC
        
        SVC -> REPO: findById
        activate REPO
        REPO -> DB: SELECT User (with password)
        DB --> REPO: User with hashed pwd
        deactivate DB
        REPO --> SVC: User
        deactivate REPO
        
        SVC -> SVC: Verify old password (BCrypt)
        
        alt Old Password Wrong
            SVC --> CTRL: 401 Error
            deactivate SVC
        else Old Password Correct
            SVC -> SVC: Hash new password (BCrypt)
            SVC -> REPO: save(userWithNewPassword)
            activate REPO
            REPO -> DB: UPDATE User password
            activate DB
            DB --> REPO: Success
            deactivate DB
            REPO --> SVC: Updated User
            deactivate REPO
            SVC --> CTRL: 200 OK
            deactivate SVC
        end
        
        CTRL --> API: Result
        deactivate CTRL
        API --> PS_SCR: Result
        deactivate API
        
        alt Success
            PS_SCR --> U: ✅ Mật khẩu đã được đổi
        else Fail
            PS_SCR --> U: ❌ Mật khẩu hiện tại sai
        end
    end
    
    deactivate PS_SCR
    
end

U -> U: ✅ Quản lý thông tin cá nhân hoàn tất

@enduml
```

---

## Architecture Summary

### Frontend Layer (React Native)
- **ProfileScreen**: Display user profile information
- **EditProfileScreen**: Edit personal info (name, email, avatar, DOB)
- **NotificationSettingsScreen**: Toggle notification preferences
- **ChangePasswordScreen**: Change password with validation
- **API Client**: HTTP client handling requests

### Backend Layer (Spring Boot)
| Layer | Components |
|-------|-----------|
| **Controllers** | UserController, SettingController |
| **Services** | UserService, SettingService, PasswordEncoder |
| **Repositories** | UserRepository, SettingRepository |
| **Database** | MySQL - User, Setting tables |

### External Services
- **Cloudinary**: Image upload and storage

### Security
- **Password Hashing**: BCrypt with salt
- **Authorization**: Assumed authenticated (token in request)

---

**Format**: PlantUML (sequence diagrams)  
**Version**: 2.0  
**Last Updated**: 2026-05-21  
**Status**: Complete with 3 merged use cases in one comprehensive diagram
