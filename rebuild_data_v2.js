const fs = require('fs');

async function fetchWord(word) {
    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await res.json();
        if (Array.isArray(data)) {
            const entry = data[0];
            const audio = entry.phonetics.find(p => p.audio)?.audio || '';
            const definition = entry.meanings[0].definitions[0].definition || '';
            const example = entry.meanings[0].definitions[0].example || 'Example sentence for ' + word + '.';
            const ipa = entry.phonetic || (entry.phonetics[0] ? entry.phonetics[0].text : '');
            return { audio, definition, example, ipa };
        }
    } catch (e) {}
    return { audio: '', definition: 'Definition for ' + word, example: 'Example for ' + word, ipa: '' };
}

async function rebuild() {
    const sets = [
        { title: 'Computer', words: ['monitor', 'keyboard', 'laptop', 'mouse', 'router'], owner: 1, activity: 1 },
        { title: 'Medical', words: ['surgery', 'vaccine', 'symptom', 'doctor', 'hospital'], owner: 1, activity: 1 },
        { title: 'Travel', words: ['passport', 'airport', 'luggage', 'journey', 'holiday'], owner: 3, activity: 1 },
        { title: 'Business', words: ['meeting', 'contract', 'salary', 'manager', 'profit'], owner: 2, activity: 1 }
    ];

    let output = "-- Memoflow Seed Data - V2\n\n";
    output += "INSERT IGNORE INTO roles (id, name, description) VALUES (1, 'ROLE_USER', 'Standard user'), (2, 'ROLE_ADMIN', 'Admin');\n\n";

    output += "INSERT IGNORE INTO learning_modes (id, name, description) VALUES \n";
    output += "(1, 'Từ vựng', 'Học từ vựng qua Flashcard và trò chơi'),\n";
    output += "(2, 'Ngữ pháp', 'Học cấu trúc câu và bài tập'),\n";
    output += "(3, 'Luyện nghe', 'Học qua audio và video');\n\n";

    output += "INSERT IGNORE INTO users (id, name, email, password, role_id, is_registered) VALUES\n";
    output += "(1, 'Alex Nguyen', 'alex.nguyen@example.com', '$2a$10$evGFmusQ6XqGTNCsj2OheOj25175Ond90MiSxns/jjy/M.ip1nTuG', 1, 1),\n";
    output += "(2, 'Admin', 'admin@example.com', '$2a$10$evGFmusQ6XqGTNCsj2OheOj25175Ond90MiSxns/jjy/M.ip1nTuG', 2, 1),\n";
    output += "(3, 'Linh Tran', 'linh.tran@example.com', '$2a$10$evGFmusQ6XqGTNCsj2OheOj25175Ond90MiSxns/jjy/M.ip1nTuG', 1, 1);\n\n";

    output += "INSERT IGNORE INTO learning_activities (id, title, description, learning_mode_id) VALUES\n";
    output += "(1, 'Ghi nhớ', 'Học từ vựng qua flashcard', 1),\n";
    output += "(2, 'Truyện chêm', 'Học từ vựng qua truyện', 1),\n";
    output += "(3, 'Nghe', 'Luyện nghe tiếng Anh', 3);\n\n";

    let media = [];
    let topics = [];
    let words = [];
    let reviews = [];

    let mid = 100;
    let tid = 1;
    let wid = 1;
    let rid = 1;

    for (const s of sets) {
        const imgUrl = `https://loremflickr.com/640/480/${s.title.toLowerCase()}`;
        media.push(`(${mid}, 'IMAGE', '${imgUrl}', 'lesson_${tid}')`);
        const topicMediaId = mid++;
        
        topics.push(`(${tid}, '${s.title} Essentials', 'FLASHCARD', 'Important vocabulary for ${s.title}', ${s.activity}, ${s.owner}, '{"privacyMode": "PUBLIC"}', ${topicMediaId})`);
        
        for (const w of s.words) {
            const data = await fetchWord(w);
            const wImg = `https://loremflickr.com/400/300/${w}`;
            media.push(`(${mid}, 'IMAGE', '${wImg}', 'word_${wid}')`);
            const wImgId = mid++;
            let wAudioId = 'NULL';
            if (data.audio) {
                media.push(`(${mid}, 'AUDIO', '${data.audio}', 'audio_${wid}')`);
                wAudioId = mid++;
            }
            
            words.push(`(${wid}, '${w}', '${data.ipa.replace(/'/g, "''")}', '${data.example.replace(/'/g, "''")}', '${data.definition.replace(/'/g, "''")}', ${tid}, ${wImgId}, ${wAudioId})`);
            wid++;
        }
        tid++;
    }

    output += "INSERT IGNORE INTO media (id, type, url, public_id) VALUES\n" + media.join(",\n") + ";\n\n";
    output += "INSERT IGNORE INTO learning_lessons (id, title, type, description, learning_activity_id, user_id, content, image_media_id) VALUES\n" + topics.join(",\n") + ";\n\n";
    output += "INSERT IGNORE INTO words (id, name, ipa, example, definition, learning_lesson_id, image_media_id, audio_media_id) VALUES\n" + words.join(",\n") + ";\n\n";

    const now = new Date();
    const diffs = ['AGAIN', 'HARD', 'GOOD', 'EASY'];

    // Day -3: Learn all 20 words
    for (let i = 1; i <= 20; i++) {
        const rd = new Date(now); rd.setDate(rd.getDate() - 3);
        const rdStr = rd.toISOString().slice(0, 19).replace('T', ' ');
        const diff = diffs[Math.floor(Math.random()*4)];
        reviews.push(`(${rid++}, 1, ${i}, '${diff}', 1, 2.5, 1, '${rdStr}', '${rdStr}')`);
    }

    // Day -2: Review 15 words
    for (let i = 1; i <= 15; i++) {
        const rd = new Date(now); rd.setDate(rd.getDate() - 2);
        const rdStr = rd.toISOString().slice(0, 19).replace('T', ' ');
        const diff = diffs[Math.floor(Math.random()*4)];
        reviews.push(`(${rid++}, 1, ${i}, '${diff}', 2, 2.5, 2, '${rdStr}', '${rdStr}')`);
    }

    // Day -1: Review 6 words
    for (let i = 1; i <= 6; i++) {
        const rd = new Date(now); rd.setDate(rd.getDate() - 1);
        const rdStr = rd.toISOString().slice(0, 19).replace('T', ' ');
        const diff = diffs[Math.floor(Math.random()*4)];
        reviews.push(`(${rid++}, 1, ${i}, '${diff}', 3, 2.5, 4, '${rdStr}', '${rdStr}')`);
    }

    // Day 0 (Today): Review 10 words
    for (let i = 1; i <= 10; i++) {
        const rdStr = now.toISOString().slice(0, 19).replace('T', ' ');
        const diff = diffs[Math.floor(Math.random()*4)];
        reviews.push(`(${rid++}, 1, ${i}, '${diff}', 4, 2.5, 9, '${rdStr}', '${rdStr}')`);
    }

    output += "INSERT IGNORE INTO flashcard_reviews (id, user_id, word_id, difficulty, repetition, ease_factor, interval_days, next_review_date, created_at) VALUES\n" + reviews.join(",\n") + ";\n\n";

    output += "INSERT IGNORE INTO user_lesson_progress (id, user_id, learning_lesson_id, is_completed, score, created_at, updated_at) VALUES\n";
    output += "(1, 1, 1, 1, 100, '2026-04-08 16:10:23', '2026-04-08 16:10:23'), (2, 1, 2, 1, 100, '2026-04-08 16:10:23', '2026-04-08 16:10:23');\n\n";

    output += "INSERT INTO notifications (type, title, message, data, is_read, created_at, user_id) VALUES\n";
    output += "('STUDY_REMINDER', 'Đã đến giờ học rồi!', 'Cùng ôn tập bộ từ mới nhé.', '{}', 0, '2026-04-08 09:58:00', 1),\n";
    output += "('STREAK_REMINDER', 'Duy trì chuỗi học tập!', 'Bạn đã học được 4 ngày liên tiếp, tiếp tục phát huy nhé!', '{}', 0, '2026-04-08 21:10:00', 1);\n";

    fs.writeFileSync('BackEnd/memoflow/src/main/resources/data.sql', output);
    console.log("data.sql rebuilt successfully!");
}

rebuild();
