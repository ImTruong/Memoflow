const extraTopics = [
  {
    title: 'Các thì (Tenses)',
    description: '12 thì cơ bản, dấu hiệu và cách dùng nhanh',
    order: 1,
  },
  {
    title: 'Cấu trúc câu (Structures)',
    description: 'Câu bị động, câu điều kiện, so sánh và động từ khuyết thiếu',
    order: 2,
  },
  {
    title: 'Mệnh đề & lời nói (Clauses)',
    description: 'Mệnh đề quan hệ, mệnh đề danh từ, mệnh đề trạng ngữ, đảo ngữ và câu tường thuật',
    order: 3,
  },
];

function pair(fillText, fillAnswer, fillExplanation, mcqText, options, correctIndex, mcqExplanation) {
  return {
    fill: { text: fillText, answer: fillAnswer, explanation: fillExplanation },
    mcq: { text: mcqText, options, correctIndex, explanation: mcqExplanation },
  };
}

const tensesLessons = require("./tenses_lessons.js");

const lessonBank = [
  ...tensesLessons,
    {
    title: 'Câu bị động',
    short: 'câu bị động',
    topic: 'Cấu trúc câu (Structures)',
    order: 1,
    engTitle: 'Passive Voice',
    description: 'Từ chủ động sang bị động ở nhiều thì thông dụng',
    sections: [
      {
        id: 1,
        title: '1. Công thức',
        type: 'formula',
        formula: 'S + be + V3/ed + (by O)',
        examples: [
          { text: 'The letter was sent yesterday.', translated: 'Lá thư đã được gửi hôm qua.', highlight: 'was sent' },
          { text: 'English is spoken worldwide.', translated: 'Tiếng Anh được nói trên toàn thế giới.', highlight: 'is spoken' },
        ],
      },
      {
        id: 2,
        title: '2. Cách dùng',
        type: 'usage',
        items: [
          { icon: 'account-tie', title: 'Khi không muốn nhấn mạnh người làm', description: 'Tập trung vào hành động hoặc kết quả.', example: 'The room was cleaned.' },
          { icon: 'layers', title: 'Báo cáo, tin tức', description: 'Thường dùng trong văn viết trang trọng.', example: 'The project was approved.' },
        ],
      },
    ],
    pairs: [
      pair('The windows ___ every week.', 'are cleaned', 'Hiện tại đơn bị động.', 'The letter ___ yesterday.', ['was sent', 'is sent', 'sent', 'were sent'], 0, 'yesterday -> quá khứ đơn bị động.'),
      pair('The cake ___ by my mother.', 'was made', 'Quá khứ đơn bị động.', 'English ___ all over the world.', ['speaks', 'is spoken', 'was speaking', 'has spoken'], 1, 'English được nói trên toàn thế giới.'),
      pair('The books ___ into the box.', 'were put', 'Quá khứ đơn bị động số nhiều.', 'This room ___ at the moment.', ['repairs', 'is being repaired', 'repaired', 'has repaired'], 1, 'at the moment -> hiện tại tiếp diễn bị động.'),
      pair('The report ___ before noon tomorrow.', 'will be submitted', 'Tương lai đơn bị động.', 'The problem ___ by the manager right now.', ['solves', 'is solved', 'is being solved', 'was solved'], 2, 'right now -> đang bị giải quyết.'),
      pair('The documents ___ by the teacher now.', 'are being checked', 'Hiện tại tiếp diễn bị động.', 'This lesson ___ by our teacher yesterday.', ['is explained', 'was explained', 'explains', 'was explaining'], 1, 'yesterday -> quá khứ đơn bị động.'),
    ],
  },
  {
    title: 'Câu điều kiện',
    short: 'câu điều kiện',
    topic: 'Cấu trúc câu (Structures)',
    order: 2,
    engTitle: 'Conditional Sentences',
    description: 'Các loại câu điều kiện từ zero đến mixed',
    sections: [
      {
        id: 1,
        title: '1. Các loại câu điều kiện',
        type: 'usage',
        items: [
          { icon: 'numeric-0-box', title: 'Zero conditional', description: 'Sự thật hiển nhiên', example: 'If you heat ice, it melts.' },
          { icon: 'numeric-1-box', title: 'First conditional', description: 'Khả năng ở hiện tại/tương lai', example: 'If it rains, we will stay home.' },
          { icon: 'numeric-2-box', title: 'Second / third conditional', description: 'Giả định không có thật', example: 'If I had time, I would travel.' },
        ],
      },
      {
        id: 2,
        title: '2. Công thức nhanh',
        type: 'formula',
        formula: 'If + present, will + V / If + past, would + V',
        examples: [
          { text: 'If water reaches 100°C, it boils.', translated: 'Nếu nước đạt 100°C, nó sôi.', highlight: 'boils' },
        ],
      },
    ],
    pairs: [
      pair('If it rains, we ___ at home.', 'will stay', 'First conditional.', 'If you heat ice, it ___.', ['melt', 'melts', 'melted', 'is melting'], 1, 'Sự thật hiển nhiên dùng present simple.'),
      pair('If I had more time, I ___ you.', 'would help', 'Second conditional.', 'If she studied harder, she ___ the test.', ['will pass', 'would pass', 'passes', 'passed'], 1, 'Giả định ở hiện tại.'),
      pair('If water reaches 100°C, it ___.', 'boils', 'Zero conditional.', 'If I were you, I ___ that job.', ['take', 'will take', 'would take', 'took'], 2, 'If I were you thường đi với would.'),
      pair('If you had called me, I ___ earlier.', 'would have come', 'Third conditional.', 'Unless you hurry, we ___ the bus.', ['miss', 'will miss', 'missed', 'are missing'], 1, 'unless = if not.'),
      pair('I will go out if the weather ___.', 'improves', 'Mệnh đề if dùng hiện tại đơn.', 'If she ___, she will be happy.', ['practices', 'practice', 'practised', 'practicing'], 0, 'will be happy ở mệnh đề chính.'),
    ],
  },
  {
    title: 'Câu so sánh',
    short: 'câu so sánh',
    topic: 'Cấu trúc câu (Structures)',
    order: 3,
    engTitle: 'Comparisons',
    description: 'So sánh hơn, so sánh nhất, so sánh bằng và dạng đặc biệt',
    sections: [
      {
        id: 1,
        title: '1. Công thức so sánh',
        type: 'formula',
        formula: 'adj-er / more adj / the most adj / as adj as',
        examples: [
          { text: 'This book is better than that one.', translated: 'Cuốn sách này hay hơn cuốn kia.', highlight: 'better' },
        ],
      },
    ],
    pairs: [
      pair('This book is ___ than that one.', 'better', 'good -> better.', 'My house is the ___ in the street.', ['largest', 'larger', 'large', 'more large'], 0, 'the + superlative.'),
      pair('She is as ___ as her brother.', 'tall', 'as + adj + as.', 'This exam is ___ difficult than the previous one.', ['more', 'most', 'much', 'many'], 0, 'difficult -> more difficult.'),
      pair('The more you study, the ___ you get.', 'better', 'The more..., the more...', 'This bag is ___ than that one.', ['heavier', 'heaviest', 'more heavy', 'heavy'], 0, 'heavy -> heavier.'),
      pair('This is the ___ movie I have ever seen.', 'most interesting', 'so sánh nhất.', 'Today is ___ than yesterday.', ['colder', 'coldest', 'more cold', 'most cold'], 0, 'cold -> colder.'),
      pair('Your idea is ___ practical than mine.', 'more', 'more + adj + than.', 'She is ___ of the two sisters.', ['the taller', 'taller', 'tallest', 'more tall'], 0, 'of the two -> the comparative.'),
    ],
  },
  {
    title: 'Động từ khuyết thiếu',
    short: 'động từ khuyết thiếu',
    topic: 'Cấu trúc câu (Structures)',
    order: 4,
    engTitle: 'Modal Verbs',
    description: 'Can, could, must, should, may, might, have to',
    sections: [
      {
        id: 1,
        title: '1. Ý nghĩa chính',
        type: 'usage',
        items: [
          { icon: 'lightbulb-on-outline', title: 'Khả năng', description: 'can, could, may, might', example: 'She can swim.' },
          { icon: 'shield-check', title: 'Nghĩa vụ', description: 'must, have to, should', example: 'You must wear a helmet.' },
          { icon: 'comment-question-outline', title: 'Đề nghị / lời khuyên', description: 'should, ought to', example: 'You should rest more.' },
        ],
      },
    ],
    pairs: [
      pair('You ___ wear a helmet on a motorbike.', 'must', 'must = bắt buộc.', 'Students ___ be late for class.', ['must not', 'may not', 'can not', 'should not'], 0, 'must not = cấm.'),
      pair('I ___ swim when I was 5.', 'could', 'could = khả năng trong quá khứ.', 'You ___ see a doctor if you feel worse.', ['should', 'must', 'can', 'may'], 0, 'should = lời khuyên.'),
      pair('It ___ rain later, so take an umbrella.', 'might', 'might = có thể xảy ra.', 'Passengers ___ fasten seatbelts during takeoff.', ['must', 'can', 'may', 'could'], 0, 'quy định bắt buộc.'),
      pair('You ___ to your parents more often.', 'should talk', 'should + V nguyên mẫu.', 'We ___ finish the report today, but it is not necessary.', ['may', 'must', 'have to', 'need'], 0, 'may = có thể.'),
      pair('He ___ be the new manager, but I am not sure.', 'may', 'may = có thể.', 'You ___ park here; it is forbidden.', ['mustn\'t', 'can\'t', 'don\'t have to', 'shouldn\'t'], 0, 'forbidden = cấm.'),
    ],
  },
  {
    title: 'Mệnh đề quan hệ',
    short: 'mệnh đề quan hệ',
    topic: 'Mệnh đề & lời nói (Clauses)',
    order: 1,
    engTitle: 'Relative Clauses',
    description: 'Who, whom, which, that, whose, where, when',
    sections: [
      {
        id: 1,
        title: '1. Đại từ quan hệ',
        type: 'markers',
        groups: [
          { title: 'NGƯỜI', items: ['who', 'whom', 'whose'] },
          { title: 'VẬT / SỰ VIỆC', items: ['which', 'that'] },
          { title: 'NƠI CHỐN / THỜI GIAN', items: ['where', 'when'] },
        ],
      },
    ],
    pairs: [
      pair('The woman ___ lives next door is my aunt.', 'who', 'who dùng cho người.', 'The book ___ I bought yesterday is interesting.', ['that', 'who', 'where', 'when'], 0, 'that dùng được cho vật.'),
      pair('This is the house ___ I was born.', 'where', 'where chỉ nơi chốn.', 'The girl ___ bike was stolen is crying.', ['whose', 'who', 'which', 'where'], 0, 'whose chỉ sở hữu.'),
      pair('The car ___ was parked outside is mine.', 'that', 'that dùng cho vật.', 'Mr. Brown, ___ teaches math, is very strict.', ['who', 'whose', 'which', 'where'], 0, 'who dùng cho người.'),
      pair('The city ___ we visited last summer is beautiful.', 'which', 'which dùng cho vật / nơi.', 'Students ___ study hard usually pass.', ['who', 'which', 'whose', 'where'], 0, 'who dùng cho người.'),
      pair('The man ___ son won a prize is proud.', 'whose', 'whose chỉ sở hữu.', 'The café ___ serves coffee is open now.', ['that', 'whose', 'where', 'when'], 0, 'that dùng cho vật.'),
    ],
  },
  {
    title: 'Mệnh đề danh từ',
    short: 'mệnh đề danh từ',
    topic: 'Mệnh đề & lời nói (Clauses)',
    order: 2,
    engTitle: 'Noun Clauses',
    description: 'Mệnh đề đóng vai trò như danh từ trong câu',
    sections: [
      {
        id: 1,
        title: '1. Vị trí thường gặp',
        type: 'usage',
        items: [
          { icon: 'alpha-a-box', title: 'Làm chủ ngữ', description: 'That he came early surprised everyone.', example: 'That he came early surprised everyone.' },
          { icon: 'alpha-c-box', title: 'Làm tân ngữ', description: 'I know that he is honest.', example: 'I know that he is honest.' },
          { icon: 'help-circle-outline', title: 'Sau giới từ / tính từ', description: 'We are afraid that he is late.', example: 'We are afraid that he is late.' },
        ],
      },
    ],
    pairs: [
      pair('I do not know ___ he will come.', 'whether', 'whether = liệu rằng.', 'She asked ___ the train would arrive.', ['when', 'why', 'what', 'which'], 0, 'when = lúc nào.'),
      pair('Tell me ___ you are late.', 'why', 'why = lý do.', 'We believe ___ hard work pays off.', ['that', 'if', 'why', 'where'], 0, 'that + mệnh đề.'),
      pair('Can you show me ___ this machine works?', 'how', 'how = cách thức.', 'The question is ___ can solve it.', ['who', 'when', 'where', 'how'], 0, 'who = ai.'),
      pair('I wonder ___ she said that.', 'why', 'why = tại sao.', 'He explained ___ he was absent.', ['that', 'if', 'why', 'what'], 0, 'that + mệnh đề giải thích.'),
      pair('Please tell me ___ the meeting starts.', 'when', 'when = khi nào.', 'They asked ___ I had finished.', ['whether', 'why', 'how', 'where'], 0, 'whether = liệu có.'),
    ],
  },
  {
    title: 'Mệnh đề trạng ngữ',
    short: 'mệnh đề trạng ngữ',
    topic: 'Mệnh đề & lời nói (Clauses)',
    order: 3,
    engTitle: 'Adverbial Clauses',
    description: 'Mệnh đề chỉ thời gian, nguyên nhân, điều kiện, mục đích, nhượng bộ',
    sections: [
      {
        id: 1,
        title: '1. Các loại mệnh đề trạng ngữ',
        type: 'markers',
        groups: [
          { title: 'THỜI GIAN', items: ['when', 'after', 'before', 'until', 'while'] },
          { title: 'NGUYÊN NHÂN', items: ['because', 'since', 'as'] },
          { title: 'NHƯỢNG BỘ / MỤC ĐÍCH', items: ['although', 'though', 'so that'] },
        ],
      },
    ],
    pairs: [
      pair('We left ___ the movie ended.', 'after', 'after = sau khi.', '___ it rains, we will stay home.', ['If', 'Because', 'Although', 'Until'], 0, 'If + present, main clause future.'),
      pair('He was tired ___ he worked all night.', 'because', 'because = bởi vì.', 'Take a coat ___ it is cold.', ['because', 'although', 'unless', 'so'], 0, 'because + lý do.'),
      pair('I will call you ___ I arrive.', 'when', 'when = khi.', '___ she was busy, she helped me.', ['Although', 'Because', 'If', 'When'], 0, 'although = mặc dù.'),
      pair('She studies hard ___ pass the exam.', 'to', 'to + V = mục đích.', 'We stopped talking ___ the teacher entered.', ['when', 'until', 'because', 'although'], 0, 'when = khi.'),
      pair('I stayed inside ___ the storm passed.', 'until', 'until = cho đến khi.', 'He runs fast ___ he can catch the bus.', ['so that', 'because', 'although', 'unless'], 0, 'so that = để mà.'),
    ],
  },
  {
    title: 'Đảo ngữ & câu tường thuật',
    short: 'đảo ngữ và câu tường thuật',
    topic: 'Mệnh đề & lời nói (Clauses)',
    order: 4,
    engTitle: 'Inversion and Reported Speech',
    description: 'Đảo ngữ, câu tường thuật và cấu trúc nhấn mạnh',
    sections: [
      {
        id: 1,
        title: '1. Đảo ngữ thường gặp',
        type: 'usage',
        items: [
          { icon: 'swap-vertical', title: 'Never / Rarely / Seldom', description: 'Never have I seen such a view.', example: 'Never have I seen such a view.' },
          { icon: 'message-text-outline', title: 'Tường thuật câu nói', description: 'He said that he was busy.', example: 'He said that he was busy.' },
        ],
      },
    ],
    pairs: [
      pair('___ had I seen him than he left.', 'No sooner', 'No sooner ... than ...', '___ did I realize the truth.', ['Only then', 'Rarely', 'Never', 'Hardly'], 0, 'Only then + đảo ngữ.'),
      pair('___ is he happy.', 'Rarely', 'Rarely + đảo ngữ.', '___ did she know about the surprise.', ['Little', 'Only', 'Never', 'So'], 0, 'Little + đảo ngữ.'),
      pair('He said that he ___ busy.', 'was', 'câu tường thuật lùi thì.', 'She asked me ___ I was going.', ['where', 'what', 'which', 'when'], 0, 'ask + wh-word.'),
      pair('They said they ___ the report the day before.', 'had finished', 'lùi thì trong reported speech.', 'He told me that he ___ to London the next day.', ['would go', 'will go', 'goes', 'went'], 0, 'next day -> would go.'),
      pair('___ can we solve this problem.', 'Only then', 'Only then + đảo ngữ.', 'Never ___ such a beautiful sunset.', ['have I seen', 'I have seen', 'I saw', 'had I seen'], 0, 'Never + trợ động từ + S + V.'),
    ],
  },
];

const practiceVariants = [
  { order: 1, difficulty: 'Dễ', durationMinutes: 10, suffix: 'Cơ bản' },
  { order: 2, difficulty: 'Trung bình', durationMinutes: 12, suffix: 'Luyện tập' },
  { order: 3, difficulty: 'Khó', durationMinutes: 15, suffix: 'Tổng hợp' },
];

function sqlString(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return sqlString(JSON.stringify(value));
}

function buildDeleteStatements() {
  const lessonTitles = lessonBank.map((lesson) => lesson.title);
  const practiceTitles = lessonBank.flatMap((lesson) => practiceVariants.map((variant) => `${variant.order}. ${lesson.short} - ${variant.suffix}`));

  return `
SET FOREIGN_KEY_CHECKS = 0;

DELETE uqa
FROM user_quiz_answers uqa
JOIN quiz_questions qq ON qq.id = uqa.quiz_question_id
JOIN quiz_groups qg ON qg.id = qq.quiz_group_id
JOIN learning_lessons ll ON ll.id = qg.learning_lesson_id
WHERE ll.title IN (${practiceTitles.map(sqlString).join(', ')});

DELETE qa
FROM quiz_answers qa
JOIN quiz_questions qq ON qq.id = qa.quiz_question_id
JOIN quiz_groups qg ON qg.id = qq.quiz_group_id
JOIN learning_lessons ll ON ll.id = qg.learning_lesson_id
WHERE ll.title IN (${practiceTitles.map(sqlString).join(', ')});

DELETE qo
FROM quiz_options qo
JOIN quiz_questions qq ON qq.id = qo.quiz_question_id
JOIN quiz_groups qg ON qg.id = qq.quiz_group_id
JOIN learning_lessons ll ON ll.id = qg.learning_lesson_id
WHERE ll.title IN (${practiceTitles.map(sqlString).join(', ')});

DELETE qq
FROM quiz_questions qq
JOIN quiz_groups qg ON qg.id = qq.quiz_group_id
JOIN learning_lessons ll ON ll.id = qg.learning_lesson_id
WHERE ll.title IN (${practiceTitles.map(sqlString).join(', ')});

DELETE qg
FROM quiz_groups qg
JOIN learning_lessons ll ON ll.id = qg.learning_lesson_id
WHERE ll.title IN (${practiceTitles.map(sqlString).join(', ')});

DELETE ulp
FROM user_lesson_progress ulp
JOIN learning_lessons ll ON ll.id = ulp.learning_lesson_id
WHERE ll.title IN (${[...lessonTitles, ...practiceTitles].map(sqlString).join(', ')});

DELETE FROM learning_lessons
WHERE title IN (${[...lessonTitles, ...practiceTitles].map(sqlString).join(', ')})
   OR title IN (${practiceTitles.map((title) => sqlString(title.replace(/^[0-9]+\. /, ''))).join(', ')});

SET FOREIGN_KEY_CHECKS = 1;
`;
}

function buildTopicsInsert() {
  const rows = extraTopics.map((topic) => `(${sqlString(topic.title)}, 'GRAMMAR_TOPIC', ${sqlString(topic.description)}, 6, ${sqlJson({ order: topic.order })})`);
  return `INSERT INTO learning_lessons (title, type, description, learning_activity_id, content) VALUES\n${rows.join(',\n')};`;
}

function buildLessonsInsert() {
  const rows = lessonBank.map((lesson) => `(${sqlString(lesson.title)}, 'GRAMMAR_LESSON', ${sqlString(lesson.description)}, 6, ${sqlJson({ order: lesson.order, engTitle: lesson.engTitle, sections: lesson.sections })})`);
  return `INSERT INTO learning_lessons (title, type, description, learning_activity_id, content) VALUES\n${rows.join(',\n')};`;
}

function buildLessonTopicUpdates() {
  return lessonBank.map((lesson) => `UPDATE learning_lessons lesson\nJOIN learning_lessons topic ON topic.type = 'GRAMMAR_TOPIC' AND topic.title = ${sqlString(lesson.topic)}\nSET lesson.content = JSON_SET(COALESCE(lesson.content, JSON_OBJECT()), '$.topicId', topic.id)\nWHERE lesson.type = 'GRAMMAR_LESSON' AND lesson.title = ${sqlString(lesson.title)};`).join('\n\n');
}

function buildPracticesInsert() {
  const rows = [];
  for (const lesson of lessonBank) {
    for (const variant of practiceVariants) {
      const title = variant.suffix;
      const description = `${lesson.short} ${variant.suffix.toLowerCase()}`;
      rows.push(`(${sqlString(title)}, 'GRAMMAR_PRACTICE', ${sqlString(description)}, 7, ${sqlJson({ order: variant.order, difficulty: variant.difficulty, durationMinutes: variant.durationMinutes, grammarLessonTitle: lesson.title })})`);
    }
  }
  return `INSERT INTO learning_lessons (title, type, description, learning_activity_id, content) VALUES\n${rows.join(',\n')};`;
}

function buildPracticeLessonUpdates() {
  const updates = [];
  for (const lesson of lessonBank) {
    for (const variant of practiceVariants) {
      const practiceTitle = variant.suffix;
      updates.push(`UPDATE learning_lessons practice\nJOIN learning_lessons grammar_lesson\n  ON grammar_lesson.type = 'GRAMMAR_LESSON'\n  AND grammar_lesson.title = JSON_UNQUOTE(JSON_EXTRACT(practice.content, '$.grammarLessonTitle'))\nSET practice.content = JSON_SET(COALESCE(practice.content, JSON_OBJECT()), '$.grammarLessonId', grammar_lesson.id)\nWHERE practice.type = 'GRAMMAR_PRACTICE' AND practice.title = ${sqlString(practiceTitle)} AND JSON_UNQUOTE(JSON_EXTRACT(practice.content, '$.grammarLessonTitle')) = ${sqlString(lesson.title)};`);
    }
  }
  return updates.join('\n\n');
}

function buildQuizGroupInsert() {
  const rows = [];
  for (const lesson of lessonBank) {
    for (const variant of practiceVariants) {
      const practiceTitle = variant.suffix;
      rows.push(`(${variant.order}, (SELECT id FROM learning_lessons WHERE type = 'GRAMMAR_PRACTICE' AND title = ${sqlString(practiceTitle)} AND JSON_UNQUOTE(JSON_EXTRACT(content, '$.grammarLessonTitle')) = ${sqlString(lesson.title)} LIMIT 1), 'GRAMMAR_PRACTICE')`);
    }
  }
  return `INSERT INTO quiz_groups (order_index, learning_lesson_id, type) VALUES\n${rows.join(',\n')};`;
}

function buildQuestionSql() {
  const questionRows = [];
  const optionRows = [];
  const answerRows = [];

  for (const lesson of lessonBank) {
    for (const variant of practiceVariants) {
      const practiceTitle = variant.suffix;
      const groupRef = `(SELECT qg.id FROM quiz_groups qg JOIN learning_lessons ll ON ll.id = qg.learning_lesson_id WHERE ll.title = ${sqlString(practiceTitle)} AND JSON_UNQUOTE(JSON_EXTRACT(ll.content, '$.grammarLessonTitle')) = ${sqlString(lesson.title)} LIMIT 1)`;

      lesson.pairs.forEach((item, pairIndex) => {
        const questionIndex = pairIndex * 2 + 1;
        const cleanText = (text) => text.includes(' - ') ? text.split(' - ')[1] : text;
        const fillText = cleanText(item.fill.text);
        const mcqText = cleanText(item.mcq.text);
        const findQSql = (text) => `(SELECT qq.id FROM quiz_questions qq JOIN quiz_groups qg ON qq.quiz_group_id = qg.id JOIN learning_lessons ll ON qg.learning_lesson_id = ll.id WHERE ll.title = ${sqlString(practiceTitle)} AND JSON_UNQUOTE(JSON_EXTRACT(ll.content, '$.grammarLessonTitle')) = ${sqlString(lesson.title)} AND qq.question_text = ${sqlString(text)} LIMIT 1)`;


        questionRows.push(`(${questionIndex}, ${groupRef}, ${sqlString(fillText)}, 'FILL_IN_BLANK', ${sqlString(item.fill.explanation)})`);
        questionRows.push(`(${questionIndex + 1}, ${groupRef}, ${sqlString(mcqText)}, 'MULTIPLE_CHOICE', ${sqlString(item.mcq.explanation)})`);

        answerRows.push(`(${sqlString(item.fill.answer)}, ${findQSql(fillText)})`);

        item.mcq.options.forEach((optionText, optionIndex) => {
          const correctFlag = optionIndex === item.mcq.correctIndex ? 1 : 0;
          optionRows.push(`(${correctFlag}, ${optionIndex + 1}, ${findQSql(mcqText)}, ${sqlString(optionText)})`);
        });
      });
    }
  }

  return {
    questionsSql: `INSERT INTO quiz_questions (order_index, quiz_group_id, question_text, type, translation) VALUES\n${questionRows.join(',\n')};`,
    optionsSql: `INSERT INTO quiz_options (is_correct, order_index, quiz_question_id, option_text) VALUES\n${optionRows.join(',\n')};`,
    answersSql: `INSERT INTO quiz_answers (answer_text, quiz_question_id) VALUES\n${answerRows.join(',\n')};`,
  };
}

function buildSql() {
  const parts = [
    '-- Auto-generated expanded grammar seed. Safe to re-run.',
    'SET NAMES utf8mb4;',
    buildDeleteStatements().trim(),
    buildTopicsInsert(),
    buildLessonsInsert(),
    buildLessonTopicUpdates(),
    buildPracticesInsert(),
    buildPracticeLessonUpdates(),
    buildQuizGroupInsert(),
  ];

  const questionSql = buildQuestionSql();
  parts.push(questionSql.questionsSql, questionSql.optionsSql, questionSql.answersSql);
  return `${parts.join('\n\n')}\n`;
}

process.stdout.write(buildSql());
