-- Insert Roles
INSERT INTO roles (name, description) VALUES ('ROLE_USER', 'Standard user role');
INSERT INTO roles (name, description) VALUES ('ROLE_ADMIN', 'Administrative user role');

-- Insert Sample User (Password is 'password' BCrypt encoded if needed, or plain for demo)
-- Note: You should use BCrypt for actual passwords.
-- $2a$10$8.UnVuG9HHgffUDAlk8qnOgufOMfH7fV9s5GPO9E5X.i.o.E.6K/q corresponds to '123456'
INSERT INTO users (name, email, password, role_id) 
VALUES ('Alex Nguyen', 'alex.nguyen@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8qnOgufOMfH7fV9s5GPO9E5X.i.o.E.6K/q', 1);

-- Insert Sample Media
INSERT INTO media (url, public_id, type) VALUES ('https://i.pravatar.cc/300?img=11', 'avatars/default', 'IMAGE');
INSERT INTO media (url, public_id, type) VALUES ('https://placeholder.com/icons/vocab', 'icons/vocab', 'IMAGE');
INSERT INTO media (url, public_id, type) VALUES ('https://placeholder.com/icons/grammar', 'icons/grammar', 'IMAGE');
INSERT INTO media (url, public_id, type) VALUES ('https://placeholder.com/icons/listening', 'icons/listening', 'IMAGE');
INSERT INTO media (url, public_id, type) VALUES ('https://placeholder.com/icons/activity', 'icons/activity', 'IMAGE');

-- Update user with avatar
UPDATE users SET avatar_media_id = 1 WHERE id = 1;

INSERT INTO learning_modes (name, description, icon_media_id) VALUES 
    ('Từ vựng', 'Ghi nhớ theo đường cong lãng quên', 2), 
    ('Ngữ pháp' , 'Lý thuyết và Trắc nghiệm', 3), 
    ('Luyện nghe', 'Đề thi mẫu Toeic', 4);

INSERT INTO learning_activities (title, description, icon_media_id, learning_mode_id) VALUES 
    ('Flashcard', 'Luyện nhớ nhanh qua thẻ', 5, 1) , 
    ('Truyện chêm' , 'Học từ vựng qua ngữ cảnh', 5, 1) , 
    ('Bài viết song ngữ', 'Đọc hiểu Anh-Việt mỗi ngày', 5, 1),
    ('Đua từ với Bot', 'Thử thách tốc độ phản xạ', 5, 1),
    ('Tinh mắt tìm từ', 'Tìm từ ẩn trong mê cung', 5, 1),
    ('Lý thuyết', 'Lý thuyết cơ bản', 5, 2),
    ('Trắc nghiệm', 'Trắc nghiệm tổng hợp', 5, 2),
    ('Trắc nghiệm', 'Trắc nghiệm luyện nghe', 5, 3);


-- Create sample learning lessons (2 PUBLIC, 2 PRIVATE)
INSERT INTO learning_lessons (title, type, description, learning_activity_id, user_id, content) VALUES 
    ('Từ vựng cơ bản', 'FLASHCARD', 'Các từ vựng phổ biến nhất cho người mới bắt đầu', 1, 1, '{"privacyMode": "PUBLIC"}'),
    ('Chủ đề Công nghệ', 'FLASHCARD', 'Từ vựng về IT và phần mềm', 1, 1, '{"privacyMode": "PUBLIC"}'),
    ('Ghi chú cá nhân 1', 'FLASHCARD', 'Học riêng tư phần 1', 1, 1, '{"privacyMode": "PRIVATE"}'),
    ('Ghi chú cá nhân 2', 'FLASHCARD', 'Học riêng tư phần 2', 1, 1, '{"privacyMode": "PRIVATE"}');

-- Create 2 words for each learning lesson
INSERT INTO words (name, ipa, example, definition, learning_lesson_id) VALUES 
    ('Hello', '/həˈloʊ/', 'Hello! How are you today?', 'Một lời chào thân mật', 1),
    ('Book', '/bʊk/', 'I am reading an interesting book.', 'Một tập hợp các trang giấy ghi chép', 1),
    ('Computer', '/kəmˈpjuːtər/', 'My computer is very fast.', 'Một thiết bị điện tử xử lý dữ liệu', 2),
    ('Software', '/ˈsɔːftwer/', 'We need to update our software.', 'Các chương trình chạy trên máy tính', 2),
    ('Private', '/ˈpraɪvət/', 'This is a private conversation.', 'Riêng tư, không công khai', 3),
    ('Secret', '/ˈsiːkrət/', 'Can you keep a secret?', 'Điều bí mật', 3),
    ('Study', '/ˈstʌdi/', 'I study English every night.', 'Học tập nghiên cứu', 4),
    ('Learn', '/lɜːrn/', 'It is never too late to learn.', 'Học được một kỹ năng mới', 4);


