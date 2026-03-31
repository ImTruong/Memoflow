-- Insert Roles
INSERT INTO roles (name, description) VALUES ('ROLE_USER', 'Standard user role');
INSERT INTO roles (name, description) VALUES ('ROLE_ADMIN', 'Administrative user role');

-- Insert Sample User (Password is 'password' BCrypt encoded if needed, or plain for demo)
-- Note: You should use BCrypt for actual passwords.
-- $2a$10$8.UnVuG9HHgffUDAlk8qnOgufOMfH7fV9s5GPO9E5X.i.o.E.6K/q corresponds to '123456'
INSERT INTO users (name, email, password, role_id, is_registered) VALUES
-- pass: 123456
('Alex Nguyen', 'alex.nguyen@example.com', '$2a$10$evGFmusQ6XqGTNCsj2OheOj25175Ond90MiSxns/jjy/M.ip1nTuG', 1, 1);

-- Insert Sample Media
INSERT INTO media (url, public_id, type) VALUES ('https://i.pravatar.cc/300?img=11', 'avatars/default', 'IMAGE');
INSERT INTO media (url, public_id, type) VALUES ('https://placeholder.com/icons/vocab', 'icons/vocab', 'IMAGE');
INSERT INTO media (url, public_id, type) VALUES ('https://placeholder.com/icons/grammar', 'icons/grammar', 'IMAGE');
INSERT INTO media (url, public_id, type) VALUES ('https://placeholder.com/icons/listening', 'icons/listening', 'IMAGE');
INSERT INTO media (url, public_id, type) VALUES ('https://placeholder.com/icons/activity', 'icons/activity', 'IMAGE');
INSERT INTO media (url, public_id, type) VALUES
('https://res.cloudinary.com/dwluretwy/video/upload/v1774782857/01_rq1jig.mp3', '01_rq1jig', 'AUDIO'),
('https://res.cloudinary.com/dwluretwy/image/upload/v1774789477/01_lasasw.jpg', '', 'IMAGE'),
('https://res.cloudinary.com/dwluretwy/video/upload/v1774782857/02_g06nwi.mp3', '02_g06nwi', 'AUDIO'),
('https://res.cloudinary.com/dwluretwy/image/upload/v1774789472/02_zuth4k.jpg', '', 'IMAGE'),
('https://res.cloudinary.com/dwluretwy/video/upload/v1774782899/03_lrl3fa.mp3', '03_lrl3fa', 'AUDIO'),
('https://res.cloudinary.com/dwluretwy/image/upload/v1774789479/03_wnpxds.jpg', '', 'IMAGE'),
('https://res.cloudinary.com/dwluretwy/video/upload/v1774782903/07_yzslmx.mp3', '', 'AUDIO'),
('https://res.cloudinary.com/dwluretwy/video/upload/v1774782904/08_ngmng4.mp3', 'audio2', 'AUDIO'),
('https://res.cloudinary.com/dwluretwy/video/upload/v1774782907/09_c51ubt.mp3', '', 'AUDIO'),
('https://res.cloudinary.com/dwluretwy/video/upload/v1774782928/32-34_prmlco.mp3', 'audio2', 'AUDIO'),
('https://res.cloudinary.com/dwluretwy/video/upload/v1774782876/35-37_kxxssj.mp3', '', 'AUDIO'),
('https://res.cloudinary.com/dwluretwy/video/upload/v1774782931/38-40_rdjetj.mp3', '', 'AUDIO'),
('https://picsum.photos/800/400?random=1', '', 'IMAGE'),
('https://picsum.photos/800/400?random=2', '', 'IMAGE'),
('https://picsum.photos/800/400?random=3', '', 'IMAGE'),
('https://picsum.photos/800/400?random=4', '', 'IMAGE'),
('https://picsum.photos/800/400?random=5', '', 'IMAGE'),
('https://picsum.photos/800/400?random=6', '', 'IMAGE');

INSERT INTO media (url, public_id, type) VALUES
('https://picsum.photos/800/400?random=10', '', 'IMAGE'),
('https://picsum.photos/800/400?random=11', '', 'IMAGE'),
('https://picsum.photos/800/400?random=12', '', 'IMAGE'),
('https://picsum.photos/800/400?random=13', '', 'IMAGE'),
('https://picsum.photos/800/400?random=14', '', 'IMAGE');

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

INSERT INTO learning_lessons (title, type, description, learning_activity_id) VALUES
    ('Test 01 - Part 1', 'LISTENING_PART_1', 'Luyện nghe part 1', 8),
    ('Test 01 - Part 2', 'LISTENING_PART_2', 'Luyện nghe part 2', 8),
    ('Test 01 - Part 3', 'LISTENING_PART_3', 'Luyện nghe part 3', 8),
    ('Test 01 - Part 4', 'LISTENING_PART_4', 'Luyện nghe part 4', 8),
    ('Test 02 - Part 1', 'LISTENING_PART_1', 'Luyện nghe part 1', 8),
    ('Test 02 - Part 2', 'LISTENING_PART_2', 'Luyện nghe part 2', 8),
    ('Test 02 - Part 3', 'LISTENING_PART_3', 'Luyện nghe part 3', 8),
    ('Test 02 - Part 4', 'LISTENING_PART_4', 'Luyện nghe part 4', 8),
    ('Test 03 - Part 1', 'LISTENING_PART_1', 'Luyện nghe part 1', 8),
    ('Test 03 - Part 2', 'LISTENING_PART_2', 'Luyện nghe part 2', 8),
    ('Test 03 - Part 3', 'LISTENING_PART_3', 'Luyện nghe part 3', 8),
    ('Test 03 - Part 4', 'LISTENING_PART_4', 'Luyện nghe part 4', 8);

INSERT INTO learning_lessons (title, type, description, learning_activity_id, content, image_media_id) VALUES
    ('The Future of AI', 'BILINGUAL', 'Tương lai của AI', 3, '{
      "createdAt": "2026-03-31 10:15:00.000000",
      "views": 15,
      "paragraphs": [
        {
          "order": 1,
          "en": "Artificial Intelligence is no longer just a concept from science fiction movies. It is actively shaping how we interact with technology today.",
          "vi": "Trí tuệ nhân tạo không còn chỉ là một khái niệm trong các bộ phim khoa học viễn tưởng. Nó đang tích cực định hình cách chúng ta tương tác với công nghệ ngày nay."
        },
        {
          "order": 2,
          "en": "Artificial Intelligence is increasingly integrated into our daily routines, from smart assistants that manage our schedules to recommendation systems that shape our entertainment choices.",
          "vi": "Trí tuệ nhân tạo ngày càng được tích hợp vào các hoạt động thường nhật, từ trợ lý thông minh giúp quản lý lịch trình cho đến hệ thống gợi ý định hình thói quen giải trí của chúng ta."
        },
        {
          "order": 3,
          "en": "In conclusion, the future of Artificial Intelligence in everyday life will be defined not only by its ability to simplify tasks but also by how responsibly we choose to integrate it.",
          "vi": "Tóm lại, tương lai của Trí tuệ nhân tạo trong đời sống hằng ngày sẽ không chỉ được định hình bởi khả năng đơn giản hóa công việc mà còn bởi cách chúng ta chọn tích hợp nó một cách có trách nhiệm."
        }
      ]
    }', 18),
    ('The Rise of Technology', 'BILINGUAL', 'Sự trỗi dậy của công nghệ', 3, '{
      "createdAt":"2026-03-04 09:00:00.000000",
      "views":12,
      "paragraphs":[
        {
          "order":1,
          "en":"Technology is rapidly transforming every aspect of our lives, from communication to education.",
          "vi":"Công nghệ đang nhanh chóng thay đổi mọi khía cạnh của cuộc sống chúng ta, từ giao tiếp đến giáo dục."
        }
      ]
    }', 19),

    ('Healthy Living', 'BILINGUAL', 'Sống khỏe mạnh', 3, '{
      "createdAt":"2026-03-05 08:30:00.000000",
      "views":20,
      "paragraphs":[
        {
          "order":1,
          "en":"Healthy living involves balanced nutrition, regular exercise, and mindful habits.",
          "vi":"Sống khỏe mạnh bao gồm chế độ dinh dưỡng cân bằng, tập thể dục thường xuyên và thói quen lành mạnh."
        }
      ]
    }', 20),

    ('Climate Change', 'BILINGUAL', 'Biến đổi khí hậu', 3, '{
      "createdAt":"2026-03-06 11:00:00.000000",
      "views":18,
      "paragraphs":[
        {
          "order":1,
          "en":"Climate change is one of the greatest challenges facing humanity today.",
          "vi":"Biến đổi khí hậu là một trong những thách thức lớn nhất mà nhân loại đang phải đối mặt."
        }
      ]
    }', 21),

    ('Digital Education', 'BILINGUAL', 'Giáo dục số', 3, '{
      "createdAt":"2026-03-07 14:20:00.000000",
      "views":22,
      "paragraphs":[
        {
          "order":1,
          "en":"Digital education provides new opportunities for learning through online platforms and interactive tools.",
          "vi":"Giáo dục số mang lại những cơ hội học tập mới thông qua các nền tảng trực tuyến và công cụ tương tác."
        }
      ]
    }', 22),

    ('Space Exploration', 'BILINGUAL', 'Khám phá vũ trụ', 3, '{
      "createdAt":"2026-03-08 16:45:00.000000",
      "views":30,
      "paragraphs":[
        {
          "order":1,
          "en":"Space exploration expands our understanding of the universe and inspires future generations.",
          "vi":"Khám phá vũ trụ mở rộng hiểu biết của chúng ta về vũ trụ và truyền cảm hứng cho các thế hệ tương lai."
        }
      ]
    }', 23);


INSERT INTO learning_lessons (title, type, description, learning_activity_id, user_id, content, image_media_id) VALUES
                                                                                                                    ('Ngọn đèn trong bão', 'TRUYEN_CHEM', 'Bài học về sự tử tế và kiên trì trong hoàn cảnh khó khăn', 2, 1, '{
      "englishTitle": "The Lantern in the Storm",
      "paragraphs": [
        "Đêm đó gió nổi lên dữ dội, mưa quất vào mái lá, cả làng chìm trong {storm} kéo dài nhiều giờ.",
        "Ông lão mang chiếc {lantern} ra trước ngõ, đứng bên con {path} quen thuộc để chỉ đường cho người đi lạc; ngọn lửa nhỏ nhưng vẫn cháy {steady}.",
        "Khi người khách trú ẩn an toàn trong {shelter}, ông lão chỉ mỉm cười, giữ lời {promise} đã hẹn với con trai là luôn {guide} người yếu trong bóng tối đến tận {horizon} bình yên."
      ],
      "vocabulary": [
        { "word": "Storm" },
        { "word": "Lantern" },
        { "word": "Path" },
        { "word": "Steady" },
        { "word": "Shelter" },
        { "word": "Promise" },
        { "word": "Guide" },
        { "word": "Horizon" }
      ]
    }', 24),
                                                                                                                    ('Chuyến xe cuối cùng', 'TRUYEN_CHEM', 'Một câu chuyện về lòng trắc ẩn trong những khoảnh khắc vội vã', 2, 1, '{
      "englishTitle": "The Last Train",
      "paragraphs": [
        "Buổi tối, Lan cầm tấm {ticket} đứng chờ ở {platform} vắng, tiếng {whistle} từ xa vang lên như gọi mọi người trở về.",
        "Tàu báo {delay} vì mưa lớn, cô định bỏ cuộc thì gặp người lái xe mang theo {parcel} cần giao gấp.",
        "Cô đổi {route} để giúp, cuối cùng cả hai đến nơi đúng {arrival}, hiểu rằng một chút {compassion} có thể nối dài hành trình."
      ],
      "vocabulary": [
        { "word": "Ticket" },
        { "word": "Platform" },
        { "word": "Whistle" },
        { "word": "Delay" },
        { "word": "Parcel" },
        { "word": "Route" },
        { "word": "Arrival" },
        { "word": "Compassion" }
      ]
    }', 25),
                                                                                                                    ('Hạt mầm và khu vườn', 'TRUYEN_CHEM', 'Kiên nhẫn và chăm sóc là chìa khóa của mọi thành quả', 2, 1, '{
      "englishTitle": "The Seed and the Garden",
      "paragraphs": [
        "Cậu bé nhận một {seed} nhỏ, chôn trong {soil} bên hàng rào và học {patience} mỗi ngày.",
        "Sau nhiều tuần, mầm non {sprout} lên, cậu bé chăm {care} và nhờ {neighbor} chỉ cách tưới hợp lý.",
        "Mùa thu tới, {harvest} đầy giỏ, hoa {bloom} rực rỡ, cậu hiểu rằng chăm chỉ sẽ nở hoa."
      ],
      "vocabulary": [
        { "word": "Seed" },
        { "word": "Soil" },
        { "word": "Patience" },
        { "word": "Sprout" },
        { "word": "Care" },
        { "word": "Neighbor" },
        { "word": "Harvest" },
        { "word": "Bloom" }
      ]
    }', 26),
                                                                                                                    ('Chiếc cầu gỗ', 'TRUYEN_CHEM', 'Sự tận tâm tạo nên những kết nối bền vững', 2, 1, '{
      "englishTitle": "The Wooden Bridge",
      "paragraphs": [
        "Con {river} chia đôi làng, người thợ {carpenter} nhận làm chiếc {bridge} nối bờ.",
        "Ông đo từng tấm ván theo {measure} chính xác để giữ {balance}, dù công việc {risky}.",
        "Khi cầu hoàn thành, dân làng bày tỏ {respect} và học được giá trị của {craft} bền bỉ."
      ],
      "vocabulary": [
        { "word": "River" },
        { "word": "Carpenter" },
        { "word": "Bridge" },
        { "word": "Measure" },
        { "word": "Balance" },
        { "word": "Risky" },
        { "word": "Respect" },
        { "word": "Craft" }
      ]
    }', 27),
                                                                                                                    ('Thư viện cũ', 'TRUYEN_CHEM', 'Gìn giữ tri thức là giữ gìn ký ức của cộng đồng', 2, 1, '{
      "englishTitle": "The Old Library",
      "paragraphs": [
        "Cô thủ thư mở cánh cửa {archive} phủ {dust}, nơi lưu giữ bao câu chuyện của thị trấn.",
        "Cô lật từng mục trong {index}, ánh mắt {curious} tìm quyển sách {fragile} bị lãng quên.",
        "Giữa không gian {whisper} yên tĩnh, cô nghe ký ức gọi về như {memory} cũ.",
        "Cô quyết tâm {restore} lại thư viện để những câu chuyện tiếp tục soi sáng thế hệ sau."
      ],
      "vocabulary": [
        { "word": "Archive" },
        { "word": "Dust" },
        { "word": "Index" },
        { "word": "Curious" },
        { "word": "Fragile" },
        { "word": "Whisper" },
        { "word": "Memory" },
        { "word": "Restore" }
      ]
    }', 28);

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

INSERT INTO quiz_groups (order_index, audio_media_id, image_media_id, learning_lesson_id, type, transcript, translation) VALUES
(1, 6, 7, 5, 'LISTENING_PART_1', '(A) A woman is painting a house.\n(B) A woman is watering a plant.\n(C) A woman is fixing a door.\n(D) A woman is sweeping a walkway.', '(A) Một người phụ nữ đang sơn nhà.\n(B) Một người phụ nữ đang tưới cây.\n(C) Một người phụ nữ đang sửa cửa.\n(D) Một người phụ nữ đang quét lối đi.'),
(2, 8, 9, 5, 'LISTENING_PART_1', '(A) They’re folding some papers.\n(B) They’re putting a picture in a frame.\n(C) They’re studying a drawing.\n(D) They’re closing a window.', '(A) Họ đang gấp vài tờ giấy.\n(B) Họ đang đặt một bức tranh vào khung.\n(C) Họ đang nghiên cứu một bản vẽ.\n(D) Họ đang đóng cửa sổ.'),
(3, 10, 11, 5, 'LISTENING_PART_1', '(A) The man is turning on a light.\n(B) The man is giving the woman a book.\n(C) The woman is posting signs on a wall.\n(D) The woman is typing on a keyboard.', '(A) Người đàn ông đang bật đèn.\n(B) Người đàn ông đang đưa cho người phụ nữ một cuốn sách.\n(C) Người phụ nữ đang dán biển báo lên tường.\n(D) Người phụ nữ đang gõ bàn phím.'),
(1, 12, NULL, 6, 'LISTENING_PART_2', 'Who wants to organize the patient files?\n(A) Min-Su would like to.\n(B) Our phone number has changed.\n(C) A well-run organization.', 'Ai muốn sắp xếp hồ sơ bệnh nhân?\n(A) Min-Su muốn làm việc đó.\n(B) Số điện thoại của chúng tôi đã thay đổi.\n(C) Một tổ chức được quản lý tốt.'),
(2, 13, NULL, 6, 'LISTENING_PART_2', 'Why didn’t Miranda shut down the computers yesterday?\n(A) Yes, my new laptop.\n(B) Outside of office 101.\n(C) Because she left early.', 'Tại sao Miranda không tắt máy tính hôm qua?\n(A) Vâng, chiếc laptop mới của tôi.\n(B) Bên ngoài văn phòng 101.\n(C) Bởi vì cô ấy về sớm.'),
(3, 14, NULL, 6, 'LISTENING_PART_2', 'Would you like the pie or the pudding for dessert?\n(A) About five dollars.\n(B) The pie sounds delicious.\n(C) I just put it on.', 'Bạn muốn ăn bánh pie hay pudding cho món tráng miệng?\n(A) Khoảng năm đô la.\n(B) Bánh pie nghe có vẻ ngon.\n(C) Tôi vừa mới mặc nó vào.'),
(1, 15, NULL, 7, 'LISTENING_PART_3', 'M-Au: Hi, Maria. Were you able to start on the wedding cakes yet?\nW-Br: Yes, I’ve started on the Anderson order. It’s a little more complex than I thought it would be.\nM-Au: Yes, they’re more complicated and they do take a little more time, but it’ll be worth it.\nW-Br: Right. We can definitely increase our bakery’s sales by offering wedding cakes. Take a look—is the color of this frosting OK?\nM-Au: Actually, the order called for a dark pink. This is a little too pale. Let me get some more food coloring from the supply closet.', 'M-Au: Chào Maria. Bạn đã bắt đầu làm bánh cưới chưa?\nW-Br: Vâng, tôi đã bắt đầu đơn hàng của Anderson. Nó hơi phức tạp hơn tôi nghĩ.\nM-Au: Đúng vậy, chúng phức tạp hơn và mất nhiều thời gian hơn, nhưng sẽ rất đáng giá.\nW-Br: Đúng rồi. Chúng ta chắc chắn có thể tăng doanh số bằng cách cung cấp bánh cưới. Nhìn này—màu kem này ổn chứ?\nM-Au: Thực ra, đơn hàng yêu cầu màu hồng đậm. Cái này hơi nhạt quá. Để tôi lấy thêm màu thực phẩm từ tủ đồ.'),
(2, 16, NULL, 7, 'LISTENING_PART_3', 'M-Cn: Hi, Joanne. I didn’t know you rode a bike to work. When did you start doing that?\nW-Am: Last week. The town just added a new bike lane on Felton Road, so now I can ride here.\nM-Cn: That’s great. I heard the town government is planning to add bike lanes on some other roads too.\nW-Am: It’s really convenient. My commute to work used to be an hour by bus, and now it’s only 25 minutes.\nM-Cn: Wow. You know, I’m a member of a local bike-riding club that takes tours on the weekends. You should join. It’s a great group.', 'M-Cn: Chào Joanne. Tôi không biết bạn đi xe đạp đến chỗ làm. Bạn bắt đầu từ khi nào vậy?\nW-Am: Tuần trước. Thị trấn vừa thêm một làn đường xe đạp trên đường Felton, nên giờ tôi có thể đi xe đến đây.\nM-Cn: Thật tuyệt. Tôi nghe nói chính quyền thị trấn đang có kế hoạch thêm làn đường xe đạp trên vài con đường khác nữa.\nW-Am: Rất tiện lợi. Trước đây tôi mất một giờ đi xe buýt để đến chỗ làm, còn bây giờ chỉ mất 25 phút.\nM-Cn: Wow. Bạn biết không, tôi là thành viên của một câu lạc bộ đi xe đạp địa phương, họ tổ chức các chuyến đi vào cuối tuần. Bạn nên tham gia. Đó là một nhóm rất tuyệt.'),
(3, 17, NULL, 7, 'LISTENING_PART_3', 'M-Au: Hello, Ms. Wilson? This is Oliver Lewis calling from Kardack Engineering. I reviewed your application for the mechanical engineer position and would like to interview you.\nW-Am: Oh, I’m happy to hear that.\nM-Au: Good. I’ll transfer you to my administrative assistant. He’ll make the arrangements for the interview.\nW-Am: Great.\nM-Cn: Hello, Ms. Wilson. This is Mr. Lewis’ assistant, Martin. I’m wondering if Wednesday at nine a.m. works for you.\nW-Am: Yes, that’s perfect. Now, I’ve never been to your office complex before. Where can I find directions?\nM-Cn: I’ll e-mail those to you.', 'M-Au: Xin chào cô Wilson? Đây là Oliver Lewis gọi từ Kardack Engineering. Tôi đã xem xét đơn ứng tuyển của cô cho vị trí kỹ sư cơ khí và muốn phỏng vấn cô.\nW-Am: Ôi, tôi rất vui khi nghe điều đó.\nM-Au: Tốt. Tôi sẽ chuyển máy cho trợ lý hành chính của tôi. Anh ấy sẽ sắp xếp buổi phỏng vấn.\nW-Am: Tuyệt vời.\nM-Cn: Xin chào cô Wilson. Tôi là Martin, trợ lý của ông Lewis. Tôi muốn hỏi liệu thứ Tư lúc 9 giờ sáng có phù hợp với cô không.\nW-Am: Vâng, rất hoàn hảo. Tôi chưa từng đến khu văn phòng của các anh trước đây. Tôi có thể tìm chỉ dẫn ở đâu?\nM-Cn: Tôi sẽ gửi email cho cô.'),
(1, 15, NULL, 8, 'LISTENING_PART_4', 'M-Au: Hi, Maria. Were you able to start on the wedding cakes yet?\nW-Br: Yes, I’ve started on the Anderson order. It’s a little more complex than I thought it would be.\nM-Au: Yes, they’re more complicated and they do take a little more time, but it’ll be worth it.\nW-Br: Right. We can definitely increase our bakery’s sales by offering wedding cakes. Take a look—is the color of this frosting OK?\nM-Au: Actually, the order called for a dark pink. This is a little too pale. Let me get some more food coloring from the supply closet.', 'M-Au: Chào Maria. Bạn đã bắt đầu làm bánh cưới chưa?\nW-Br: Vâng, tôi đã bắt đầu đơn hàng của Anderson. Nó hơi phức tạp hơn tôi nghĩ.\nM-Au: Đúng vậy, chúng phức tạp hơn và mất nhiều thời gian hơn, nhưng sẽ rất đáng giá.\nW-Br: Đúng rồi. Chúng ta chắc chắn có thể tăng doanh số bằng cách cung cấp bánh cưới. Nhìn này—màu kem này ổn chứ?\nM-Au: Thực ra, đơn hàng yêu cầu màu hồng đậm. Cái này hơi nhạt quá. Để tôi lấy thêm màu thực phẩm từ tủ đồ.'),
(2, 16, NULL, 8, 'LISTENING_PART_4', 'M-Cn: Hi, Joanne. I didn’t know you rode a bike to work. When did you start doing that?\nW-Am: Last week. The town just added a new bike lane on Felton Road, so now I can ride here.\nM-Cn: That’s great. I heard the town government is planning to add bike lanes on some other roads too.\nW-Am: It’s really convenient. My commute to work used to be an hour by bus, and now it’s only 25 minutes.\nM-Cn: Wow. You know, I’m a member of a local bike-riding club that takes tours on the weekends. You should join. It’s a great group.', 'M-Cn: Chào Joanne. Tôi không biết bạn đi xe đạp đến chỗ làm. Bạn bắt đầu từ khi nào vậy?\nW-Am: Tuần trước. Thị trấn vừa thêm một làn đường xe đạp trên đường Felton, nên giờ tôi có thể đi xe đến đây.\nM-Cn: Thật tuyệt. Tôi nghe nói chính quyền thị trấn đang có kế hoạch thêm làn đường xe đạp trên vài con đường khác nữa.\nW-Am: Rất tiện lợi. Trước đây tôi mất một giờ đi xe buýt để đến chỗ làm, còn bây giờ chỉ mất 25 phút.\nM-Cn: Wow. Bạn biết không, tôi là thành viên của một câu lạc bộ đi xe đạp địa phương, họ tổ chức các chuyến đi vào cuối tuần. Bạn nên tham gia. Đó là một nhóm rất tuyệt.'),
(3, 17, NULL, 8, 'LISTENING_PART_4', 'M-Au: Hello, Ms. Wilson? This is Oliver Lewis calling from Kardack Engineering. I reviewed your application for the mechanical engineer position and would like to interview you.\nW-Am: Oh, I’m happy to hear that.\nM-Au: Good. I’ll transfer you to my administrative assistant. He’ll make the arrangements for the interview.\nW-Am: Great.\nM-Cn: Hello, Ms. Wilson. This is Mr. Lewis’ assistant, Martin. I’m wondering if Wednesday at nine a.m. works for you.\nW-Am: Yes, that’s perfect. Now, I’ve never been to your office complex before. Where can I find directions?\nM-Cn: I’ll e-mail those to you.', 'M-Au: Xin chào cô Wilson? Đây là Oliver Lewis gọi từ Kardack Engineering. Tôi đã xem xét đơn ứng tuyển của cô cho vị trí kỹ sư cơ khí và muốn phỏng vấn cô.\nW-Am: Ôi, tôi rất vui khi nghe điều đó.\nM-Au: Tốt. Tôi sẽ chuyển máy cho trợ lý hành chính của tôi. Anh ấy sẽ sắp xếp buổi phỏng vấn.\nW-Am: Tuyệt vời.\nM-Cn: Xin chào cô Wilson. Tôi là Martin, trợ lý của ông Lewis. Tôi muốn hỏi liệu thứ Tư lúc 9 giờ sáng có phù hợp với cô không.\nW-Am: Vâng, rất hoàn hảo. Tôi chưa từng đến khu văn phòng của các anh trước đây. Tôi có thể tìm chỉ dẫn ở đâu?\nM-Cn: Tôi sẽ gửi email cho cô.');

INSERT INTO quiz_questions (order_index, quiz_group_id, question_text, type, translation) VALUES
(1, 1, '', '', NULL),
(1, 2, '', '', NULL),
(1, 3, '', '', NULL),
(1, 4, '', '', NULL),
(1, 5, '', '', NULL),
(1, 6, '', '', NULL),
(1, 7, 'What is the main topic of the talk?', '', 'Chủ đề chính của bài nói là gì?\n(A) Thành tựu của công ty.\n(B) Sự kiện sắp tới.\n(C) Phúc lợi nhân viên.\n(D) Kết quả tài chính.'),
(2, 7, 'What does the speaker say about the schedule?', '', 'Người nói đề cập gì về lịch trình?\n(A) Nó sẽ bị trì hoãn.\n(B) Nó vẫn giữ nguyên.\n(C) Nó sẽ được rút ngắn.\n(D) Nó sẽ được kéo dài.'),
(3, 7, 'What should the audience do next?', '', 'Khán giả nên làm gì tiếp theo?\n(A) Gửi phản hồi.\n(B) Tham dự một cuộc họp.\n(C) Xem lại tài liệu.\n(D) Liên hệ phòng nhân sự.'),
(1, 8, 'Who is the intended audience of the announcement?', '', 'Đối tượng mà thông báo hướng tới là ai?\n(A) Nhân viên.\n(B) Khách hàng.\n(C) Nhà đầu tư.\n(D) Nhà cung cấp.'),
(2, 8, 'What is mentioned about the new policy?', '', 'Chính sách mới được đề cập như thế nào?\n(A) Nó sẽ bắt đầu từ tháng sau.\n(B) Nó là tùy chọn.\n(C) Nó sẽ thay thế chính sách cũ.\n(D) Nó yêu cầu đào tạo.'),
(3, 8, 'What is the speaker’s tone?', '', 'Giọng điệu của người nói là gì?\n(A) Khích lệ.\n(B) Trung lập.\n(C) Phê phán.\n(D) Hài hước.'),
(1, 9, 'What is the main topic of the talk?', '', 'Chủ đề chính của bài nói là gì?\n(A) Thành tựu của công ty.\n(B) Sự kiện sắp tới.\n(C) Phúc lợi nhân viên.\n(D) Kết quả tài chính.'),
(2, 9, 'What does the speaker say about the schedule?', '', 'Người nói đề cập gì về lịch trình?\n(A) Nó sẽ bị trì hoãn.\n(B) Nó vẫn giữ nguyên.\n(C) Nó sẽ được rút ngắn.\n(D) Nó sẽ được kéo dài.'),
(3, 9, 'What should the audience do next?', '', 'Khán giả nên làm gì tiếp theo?\n(A) Gửi phản hồi.\n(B) Tham dự một cuộc họp.\n(C) Xem lại tài liệu.\n(D) Liên hệ phòng nhân sự.'),
(1, 10, 'Who is the intended audience of the announcement?', '', 'Đối tượng mà thông báo hướng tới là ai?\n(A) Nhân viên.\n(B) Khách hàng.\n(C) Nhà đầu tư.\n(D) Nhà cung cấp.'),
(2, 10, 'What is mentioned about the new policy?', '', 'Chính sách mới được đề cập như thế nào?\n(A) Nó sẽ bắt đầu từ tháng sau.\n(B) Nó là tùy chọn.\n(C) Nó sẽ thay thế chính sách cũ.\n(D) Nó yêu cầu đào tạo.'),
(3, 10, 'What is the speaker’s tone?', '', 'Giọng điệu của người nói là gì?\n(A) Khích lệ.\n(B) Trung lập.\n(C) Phê phán.\n(D) Hài hước.'),
(1, 11, 'What is the main topic of the talk?', '', 'Chủ đề chính của bài nói là gì?\n(A) Thành tựu của công ty.\n(B) Sự kiện sắp tới.\n(C) Phúc lợi nhân viên.\n(D) Kết quả tài chính.'),
(2, 11, 'What does the speaker say about the schedule?', '', 'Người nói đề cập gì về lịch trình?\n(A) Nó sẽ bị trì hoãn.\n(B) Nó vẫn giữ nguyên.\n(C) Nó sẽ được rút ngắn.\n(D) Nó sẽ được kéo dài.'),
(3, 11, 'What should the audience do next?', '', 'Khán giả nên làm gì tiếp theo?\n(A) Gửi phản hồi.\n(B) Tham dự một cuộc họp.\n(C) Xem lại tài liệu.\n(D) Liên hệ phòng nhân sự.'),
(1, 12, 'Who is the intended audience of the announcement?', '', 'Đối tượng mà thông báo hướng tới là ai?\n(A) Nhân viên.\n(B) Khách hàng.\n(C) Nhà đầu tư.\n(D) Nhà cung cấp.'),
(2, 12, 'What is mentioned about the new policy?', '', 'Chính sách mới được đề cập như thế nào?\n(A) Nó sẽ bắt đầu từ tháng sau.\n(B) Nó là tùy chọn.\n(C) Nó sẽ thay thế chính sách cũ.\n(D) Nó yêu cầu đào tạo.'),
(3, 12, 'What is the speaker’s tone?', '', 'Giọng điệu của người nói là gì?\n(A) Khích lệ.\n(B) Trung lập.\n(C) Phê phán.\n(D) Hài hước.');

INSERT INTO quiz_options (is_correct, order_index, quiz_question_id, option_text) VALUES
(0, 1, 1, ''),
(1, 2, 1, ''),
(0, 3, 1, ''),
(0, 4, 1, ''),
(1, 1, 2, ''),
(0, 2, 2, ''),
(0, 3, 2, ''),
(0, 4, 2, ''),
(0, 1, 3, ''),
(0, 2, 3, ''),
(0, 3, 3, ''),
(1, 4, 3, ''),
(0, 2, 4, ''),
(1, 3, 4, ''),
(0, 4, 4, ''),
(1, 2, 5, ''),
(0, 3, 5, ''),
(0, 4, 5, ''),
(0, 2, 6, ''),
(0, 3, 6, ''),
(1, 4, 6, ''),
(0, 1, 7, 'Company achievements'),
(1, 2, 7, 'Upcoming events'),
(0, 3, 7, 'Employee benefits'),
(0, 4, 7, 'Financial results'),
(0, 1, 8, 'It will be delayed'),
(1, 2, 8, 'It remains unchanged'),
(0, 3, 8, 'It will be shortened'),
(0, 4, 8, 'It will be extended'),
(1, 1, 9, 'Submit feedback'),
(0, 2, 9, 'Attend a meeting'),
(0, 3, 9, 'Review documents'),
(0, 4, 9, 'Contact HR'),
(1, 1, 10, 'Employees'),
(0, 2, 10, 'Customers'),
(0, 3, 10, 'Investors'),
(0, 4, 10, 'Suppliers'),
(0, 1, 11, 'It will start next month'),
(1, 2, 11, 'It is optional'),
(0, 3, 11, 'It replaces the old one'),
(0, 4, 11, 'It requires training'),
(1, 1, 12, 'Encouraging'),
(0, 2, 12, 'Neutral'),
(0, 3, 12, 'Critical'),
(0, 4, 12, 'Humorous'),
(0, 1, 13, 'Company achievements'),
(1, 2, 13, 'Upcoming events'),
(0, 3, 13, 'Employee benefits'),
(0, 4, 13, 'Financial results'),
(0, 1, 14, 'It will be delayed'),
(1, 2, 14, 'It remains unchanged'),
(0, 3, 14, 'It will be shortened'),
(0, 4, 14, 'It will be extended'),
(1, 1, 15, 'Submit feedback'),
(0, 2, 15, 'Attend a meeting'),
(0, 3, 15, 'Review documents'),
(0, 4, 15, 'Contact HR'),
(1, 1, 16, 'Employees'),
(0, 2, 16, 'Customers'),
(0, 3, 16, 'Investors'),
(0, 4, 16, 'Suppliers'),
(0, 1, 17, 'It will start next month'),
(1, 2, 17, 'It is optional'),
(0, 3, 17, 'It replaces the old one'),
(0, 4, 17, 'It requires training'),
(1, 1, 18, 'Encouraging'),
(0, 2, 18, 'Neutral'),
(0, 3, 18, 'Critical'),
(0, 4, 18, 'Humorous'),
(0, 1, 19, 'Company achievements'),
(1, 2, 19, 'Upcoming events'),
(0, 3, 19, 'Employee benefits'),
(0, 4, 19, 'Financial results'),
(0, 1, 20, 'It will be delayed'),
(1, 2, 20, 'It remains unchanged'),
(0, 3, 20, 'It will be shortened'),
(0, 4, 20, 'It will be extended'),
(1, 1, 21, 'Submit feedback'),
(0, 2, 21, 'Attend a meeting'),
(0, 3, 21, 'Review documents'),
(0, 4, 21, 'Contact HR'),
(1, 1, 22, 'Employees'),
(0, 2, 22, 'Customers'),
(0, 3, 22, 'Investors'),
(0, 4, 22, 'Suppliers'),
(0, 1, 23, 'It will start next month'),
(1, 2, 23, 'It is optional'),
(0, 3, 23, 'It replaces the old one'),
(0, 4, 23, 'It requires training'),
(1, 1, 24, 'Encouraging'),
(0, 2, 24, 'Neutral'),
(0, 3, 24, 'Critical'),
(0, 4, 24, 'Humorous');

INSERT INTO user_lesson_progress (is_completed, learning_lesson_id, user_id, created_at) VALUES
(1, 5, 1, '2026-03-01 10:15:00'),
(0, 9,  1, '2026-03-05 14:30:00'),
(1, 6, 1, '2026-03-10 09:45:00'),
(0, 10, 1, '2026-03-12 16:20:00'),
(1, 7,  1, '2026-03-15 08:50:00'),
(0, 11, 1, '2026-03-18 19:05:00'),
(1, 8,  1, '2026-03-15 08:50:00'),
(0, 12, 1, '2026-03-18 19:05:00');

INSERT INTO learning_lessons (title, type, description, learning_activity_id, content) VALUES
('Animals', 'WORD_HUNT', 'Tim 5 tu vung chu de dong vat trong 01:45.', 5, '{"categoryKey":"animals","categoryLabel":"Animals","boardSize":6,"timeLimitSeconds":105,"targetWordCount":5,"maxHintsPerDay":3,"objectiveText":"Muc tieu: 5 tu","words":["LION","TIGER","RABBIT","HORSE","SNAKE","MONKEY"]}'),
('Nature', 'WORD_HUNT', 'Tap trung nhin nhanh, tim du 5 tu trong chu de thien nhien.', 5, '{"categoryKey":"nature","categoryLabel":"Nature","boardSize":8,"timeLimitSeconds":105,"targetWordCount":5,"maxHintsPerDay":3,"objectiveText":"Muc tieu: 5 tu","words":["RIVER","MOUNTAIN","FOREST","RAIN","CLOUD","STONE"]}'),
('Food', 'WORD_HUNT', 'Man dang choi: tim du 5 tu truoc khi het gio.', 5, '{"categoryKey":"food","categoryLabel":"Food","boardSize":10,"timeLimitSeconds":105,"targetWordCount":5,"maxHintsPerDay":3,"objectiveText":"Muc tieu: 5 tu","words":["PIZZA","CAKE","SOUP","TACO","RICE","STEAK","BURGER"]}'),
('Travel', 'WORD_HUNT', 'Mo khoa sau khi hoan thanh Food.', 5, '{"categoryKey":"travel","categoryLabel":"Travel","boardSize":8,"timeLimitSeconds":120,"targetWordCount":6,"maxHintsPerDay":3,"objectiveText":"Muc tieu: 6 tu","unlockRequirementText":"Can vuot qua Food de mo khoa","words":["HOTEL","FLIGHT","PASSPORT","TICKET","LUGGAGE","BEACH"]}'),
('Sports', 'WORD_HUNT', 'Mo khoa sau khi hoan thanh Travel.', 5, '{"categoryKey":"sports","categoryLabel":"Sports","boardSize":10,"timeLimitSeconds":120,"targetWordCount":6,"maxHintsPerDay":3,"objectiveText":"Muc tieu: 6 tu","unlockRequirementText":"Can vuot qua Travel de mo khoa","words":["TENNIS","SOCCER","BOXING","RUNNING","SWIM","VOLLEY"]}'),
('Technology', 'WORD_HUNT', 'Mo khoa sau khi hoan thanh Sports.', 5, '{"categoryKey":"technology","categoryLabel":"Technology","boardSize":10,"timeLimitSeconds":150,"targetWordCount":7,"maxHintsPerDay":3,"objectiveText":"Muc tieu: 7 tu","unlockRequirementText":"Can vuot qua Sports de mo khoa","words":["SERVER","ROUTER","CODING","BINARY","MOBILE","CLOUD","SCREEN"]}');