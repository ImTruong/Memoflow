const fs = require('fs');
const path = require('path');

const tenses = [
  { name: 'Hiện tại đơn', eng: 'Present Simple', desc: 'Thói quen, sự thật hiển nhiên', form: 'S + V(s/es)', markers: ['always', 'usually', 'often', 'sometimes', 'never', 'every day'], examples: [{ text: 'She reads a book every night.', translated: 'Cô ấy đọc sách mỗi tối.', highlight: 'reads' }], usage: 'Dùng để diễn tả một thói quen, một hành động lặp đi lặp lại hoặc một sự thật hiển nhiên.', templates: [
      ['He ___ to school every day.', 'goes', 'Thói quen dùng HTĐ.', 'She ___ early in the morning.', ['get up', 'gets up', 'getting up', 'got up'], 1, 'Ngôi 3 số ít thêm s/es.'],
      ['Water ___ at 100 degrees.', 'boils', 'Sự thật.', 'Earth ___ around the sun.', ['revolves', 'revolve', 'revolving', 'revolved'], 0, 'Sự thật.'],
      ['My father never ___ coffee.', 'drinks', 'never + HTĐ.', 'We often ___ football on Sunday.', ['plays', 'play', 'playing', 'played'], 1, 'often chỉ tần suất.'],
      ['The sun ___ in the East.', 'rises', 'Sự thật.', 'Vegetarians ___ meat.', ['does not eat', 'do not eat', 'not eating', 'eats not'], 1, 'Số nhiều do not.'],
      ['___ you like apples?', 'Do', 'Câu hỏi cho You.', '___ he live here?', ['Do', 'Does', 'Is', 'Are'], 1, 'Does cho he.'],
      ['I ___ not know the answer.', 'do', 'Phủ định I.', 'She ___ not like spicy food.', ['do', 'doing', 'does', 'did'], 2, 'Does cho she.'],
      ['The train ___ at 8 AM.', 'leaves', 'Lịch trình HTĐ.', 'The store ___ at 9 AM.', ['open', 'opens', 'opening', 'opened'], 1, 'Ngôi số ít.'],
      ['Cats ___ milk.', 'like', 'Sự thật.', 'Birds ___ in the sky.', ['fly', 'flies', 'flying', 'flew'], 0, 'Số nhiều không thêm s.']
  ]},
  { name: 'Hiện tại tiếp diễn', eng: 'Present Continuous', desc: 'Hành động đang xảy ra', form: 'S + am/is/are + V-ing', markers: ['now', 'at the moment', 'right now', 'Look!', 'Listen!'], examples: [{ text: 'I am reading a book now.', translated: 'Tôi đang đọc một quyển sách bây giờ.', highlight: 'am reading' }], usage: 'Dùng cho hành động đang xảy ra tại thời điểm nói.', templates: [
      ['Look! The baby ___ on the bed.', 'is sleeping', 'Look! là HTTD.', 'Listen! Someone ___ the door.', ['knocks', 'knocked', 'is knocking', 'was knocking'], 2, 'Listen! là HTTD.'],
      ['We ___ studying English at the moment.', 'are', 'We + are.', 'She ___ TV right now.', ['watches', 'is watching', 'watched', 'was watching'], 1, 'am/is/are + V-ing.'],
      ['Hurry up! The bus ___.', 'is coming', 'Đang xảy ra.', 'They ___ lunch now.', ['are having', 'have', 'had', 'has'], 0, 'Now -> HTTD.'],
      ['I ___ not working today.', 'am', 'I am not.', 'He ___ playing games at present.', ['is not', 'do not', 'does not', 'not'], 0, 'He is not + Ving.'],
      ['___ you listening to me?', 'Are', 'Are you + V-ing.', '___ she crying?', ['Is', 'Are', 'Do', 'Does'], 0, 'Is she + Ving.'],
      ['The children are ___ outside.', 'playing', 'are + V-ing.', 'The dog is ___ quickly.', ['running', 'run', 'runs', 'ran'], 0, 'is + V-ing.'],
      ['It ___ raining heavily now.', 'is', 'It is + Ving.', 'I am ___ an email.', ['write', 'writing', 'wrote', 'writes'], 1, 'am + V-ing.'],
      ['They are ___ a new car.', 'buying', 'are + V-ing.', 'The phone is ___.', ['ring', 'ringing', 'rings', 'rang'], 1, 'is + V-ing.']
  ]},
  { name: 'Hiện tại hoàn thành', eng: 'Present Perfect', desc: 'Hành động từ quá khứ đến hiện tại', form: 'S + have/has + V3/ed', markers: ['just', 'recently', 'lately', 'ever', 'never', 'already', 'yet', 'since', 'for', 'so far'], examples: [{ text: 'I have finished my homework.', translated: 'Tôi đã làm xong bài tập.', highlight: 'have finished' }], usage: 'Diễn tả hành động xảy ra trong quá khứ liên quan đến hiện tại.', templates: [
      ['I ___ already eaten lunch.', 'have', 'I have.', 'She has ___ the letter.', ['sent', 'send', 'sends', 'sending'], 0, 'has + V3.'],
      ['They have lived here ___ 2010.', 'since', 'since + mốc thời gian.', 'We have known him ___ 5 years.', ['since', 'for', 'in', 'at'], 1, 'for + khoảng.'],
      ['Have you ___ been to Paris?', 'ever', 'ever: đã từng.', 'I have ___ seen a ghost.', ['ever', 'never', 'yet', 'just'], 1, 'never: chưa bao giờ.'],
      ['He has ___ arrived.', 'just', 'vừa mới.', 'I haven\'t finished ___.', ['already', 'yet', 'just', 'ever'], 1, 'yet dùng ở phủ định.'],
      ['The company ___ grown rapidly so far.', 'has', 'Số ít -> has.', 'How many times ___ you visited this place?', ['do', 'did', 'have', 'are'], 2, 'How many times -> HTHT.'],
      ['She has ___ the keys.', 'lost', 'V3 của lose.', 'They have ___ a new house.', ['buy', 'bought', 'buying', 'buys'], 1, 'V3 của buy.'],
      ['___ she told you the truth?', 'Has', 'Câu hỏi.', '___ you done the homework?', ['Do', 'Did', 'Have', 'Has'], 2, 'Have you + V3.'],
      ['I have ___ this laptop for 2 years.', 'used', 'V3.', 'We have ___ good friends since childhood.', ['be', 'is', 'were', 'been'], 3, 'V3 của be.']
  ]},
  { name: 'Hiện tại hoàn thành tiếp diễn', eng: 'Present Perfect Continuous', desc: 'Sự liên tục của hành động từ quá khứ', form: 'S + have/has + been + V-ing', markers: ['all day/week', 'for the whole month', 'since', 'for'], examples: [{ text: 'I have been waiting for 2 hours.', translated: 'Tôi đã chờ 2 tiếng.', highlight: 'have been waiting' }], usage: 'Nhấn mạnh quá trình của hành động bắt đầu trong quá khứ và tiếp tục đến hiện tại.', templates: [
      ['I have ___ studying all morning.', 'been', 'have been + Vying.', 'She has been ___ English for 3 years.', ['learn', 'learned', 'learning', 'learns'], 2, 'has been + Ving.'],
      ['They ___ been playing football since 3 PM.', 'have', 'They have.', 'He ___ been working here since 2015.', ['have', 'has', 'is', 'was'], 1, 'He has.'],
      ['How long have you been ___ for me?', 'waiting', 'Ving.', 'It has been ___ all day.', ['rain', 'rained', 'raining', 'rains'], 2, 'Ving.'],
      ['We have been ___ on this project for months.', 'working', 'Ving.', 'I have been ___ this book all week.', ['read', 'reading', 'readed', 'reads'], 1, 'Ving.'],
      ['Has she been ___ today?', 'crying', 'Ving.', '___ you been sleeping all morning?', ['Have', 'Has', 'Do', 'Did'], 0, 'Have you been...'],
      ['I am tired because I have been ___ hard.', 'running', 'Nhấn mạnh quá trình.', 'Her eyes are red. She has been ___.', ['cry', 'crying', 'cried', 'cries'], 1, 'Kết quả hiện tại do quá trình.'],
      ['He has been ___ to call you for an hour.', 'trying', 'Ving.', 'They have been ___ non-stop.', ['talk', 'talked', 'talking', 'talks'], 2, 'Ving.'],
      ['We have been ___ the house all weekend.', 'painting', 'Ving.', 'Has it been ___ long?', ['snow', 'snowing', 'snowed', 'snows'], 1, 'Ving.']
  ]},
  { name: 'Quá khứ đơn', eng: 'Past Simple', desc: 'Hành động đã xảy ra và chấm dứt trong quá khứ', form: 'S + V-ed/V2', markers: ['yesterday', 'last', 'ago', 'in + năm quá khứ'], examples: [{ text: 'I went to school yesterday.', translated: 'Tôi đã đi học hôm qua.', highlight: 'went' }], usage: 'Một hành động diễn ra tại một thời điểm xác định trong quá khứ và đã kết thúc hoàn toàn.', templates: [
      ['I ___ him yesterday.', 'saw', 'V2.', 'She ___ in Hanoi last year.', ['lives', 'lived', 'is living', 'has lived'], 1, 'last year -> quá khứ đơn.'],
      ['We ___ to the beach last summer.', 'went', 'V2.', 'They ___ a house two days ago.', ['buy', 'bought', 'buying', 'have bought'], 1, 'ago -> quá khứ đơn.'],
      ['I did ___ go there.', 'not', 'phủ định = did not.', 'He didn\'t ___ the answer.', ['knew', 'knowing', 'knows', 'know'], 3, 'didn\'t + V nguyên thể.'],
      ['___ you see the movie last night?', 'Did', 'Câu hỏi quá khứ.', '___ she call you yesterday?', ['Do', 'Does', 'Did', 'Have'], 2, 'Câu hỏi QKĐ dùng Did.'],
      ['The car ___ down clearly.', 'broke', 'Quá khứ của break.', 'I ___ my key last week.', ['lose', 'lost', 'losing', 'loses'], 1, 'last week.'],
      ['She ___ her homework yesterday evening.', 'finished', 'Thêm ed.', 'We ___ TV together last night.', ['watch', 'watched', 'watching', 'watches'], 1, 'last night.'],
      ['Columbus ___ America in 1492.', 'discovered', 'Sự kiện lịch sử.', 'World War II ___ in 1945.', ['end', 'ended', 'ending', 'ends'], 1, 'Sự kiện lịch sử.'],
      ['I ___ very happy when I got the gift.', 'was', 'Quá khứ của be với I.', 'They ___ at home yesterday.', ['is', 'are', 'was', 'were'], 3, 'Quá khứ be số nhiều.']
  ]},
  { name: 'Quá khứ tiếp diễn', eng: 'Past Continuous', desc: 'Hành động đang xảy ra tại thời điểm quá khứ cụ thể', form: 'S + was/were + V-ing', markers: ['at + giờ + yesterday', 'at this time last week', 'when', 'while'], examples: [{ text: 'I was sleeping when she called.', translated: 'Tôi đang ngủ khi cô ấy gọi tới.', highlight: 'was sleeping' }], usage: 'Hành động đang diễn ra tại một thời điểm xác định trong quá khứ hoặc một hành động đang làm thì bị một hành động khác xen vào.', templates: [
      ['I ___ sleeping at 10 PM yesterday.', 'was', 'I was.', 'They ___ playing football at this time last Sunday.', ['were', 'was', 'are', 'have'], 0, 'They were.'],
      ['When the phone rang, I ___ cooking.', 'was', 'was cooking.', 'While she ___ reading, the light went out.', ['was', 'were', 'is', 'has'], 0, 'she was.'],
      ['We were ___ dinner when he arrived.', 'having', 'were + Ving.', 'I ___ walking down the street when it started to rain.', ['were', 'am', 'was', 'have'], 2, 'I was.'],
      ['They were ___ loudly in the class.', 'talking', 'were + Ving.', 'She was ___ a song.', ['sing', 'singing', 'sang', 'sings'], 1, 'was + Ving.'],
      ['___ you sleeping when I called?', 'Were', 'Câu hỏi.', '___ he working at 8 PM yesterday?', ['Was', 'Were', 'Is', 'Are'], 0, 'Was he.'],
      ['I wasn\'t ___ attention.', 'paying', 'wasn\'t + Ving.', 'They weren\'t ___ yesterday evening.', ['study', 'studying', 'studied', 'studies'], 1, 'weren\'t + Ving.'],
      ['What were you ___ at 8 o\'clock?', 'doing', 'were doing.', 'Where you ___ when the accident happened?', ['was going', 'were going', 'went', 'have gone'], 1, 'were going.'],
      ['While I was studying, my brother ___ playing games.', 'was', '2 hành động song song.', 'While we were eating, they ___ sleeping.', ['was', 'were', 'are', 'is'], 1, 'they were.']
  ]},
  { name: 'Quá khứ hoàn thành', eng: 'Past Perfect', desc: 'Hành động xảy ra trước một hành động quá khứ khác', form: 'S + had + V3/ed', markers: ['by the time', 'prior to', 'before', 'after'], examples: [{ text: 'I had eaten before I arrived.', translated: 'Tôi đã ăn trước khi đến.', highlight: 'had eaten' }], usage: 'Hành động đã hoàn thành trước một thời điểm hoặc hành động khác trong quá khứ.', templates: [
      ['I ___ left before he came.', 'had', 'Quá khứ hoàn thành.', 'By the time she arrived, we had ___.', ['finish', 'finished', 'finishing', 'finishes'], 1, 'had + V3.'],
      ['After they ___ eaten, they went out.', 'had', 'After + QKHT.', 'Before I went to bed, I ___ locked the door.', ['have', 'had', 'was', 'did'], 1, 'Before + QKĐ, vế kia dùng QKHT.'],
      ['He failed the test because he had not ___ hard.', 'studied', 'had not + V3.', 'She hadn\'t ___ the book before you asked about it.', ['read', 'reading', 'readed', 'reads'], 0, 'hadn\'t + V3.'],
      ['Had you ___ to London before 2010?', 'been', 'Had + S + V3.', '___ they finished the work before the deadline?', ['Had', 'Have', 'Did', 'Were'], 0, 'Had they finished.'],
      ['When I arrived, the train had already ___.', 'left', 'had + V3.', 'He realized he ___ made a mistake.', ['has', 'having', 'had', 'did'], 2, 'had made (xảy ra trước).'],
      ['They had ___ married for 5 years when they divorced.', 'been', 'had been.', 'I didn\'t know who she was. I had never ___ her.', ['seen', 'see', 'saw', 'seeing'], 0, 'had never seen.'],
      ['She got a good grade because she ___ prepared well.', 'had', 'had prepared.', 'The house was dirty. They ___ cleaned it for weeks.', ['haven\'t', 'hadn\'t', 'didn\'t', 'weren\'t'], 1, 'hadn\'t cleaned.'],
      ['I thought I ___ met him somewhere before.', 'had', 'had met.', 'We ___ lost the key, so we couldn\'t get in.', ['have', 'had', 'did', 'was'], 1, 'had lost.']
  ]},
  { name: 'Quá khứ hoàn thành tiếp diễn', eng: 'Past Perfect Continuous', desc: 'Tính liên tục của hành động xảy ra trước quá khứ', form: 'S + had + been + V-ing', markers: ['for', 'since', 'how long', 'before'], examples: [{ text: 'I had been waiting for 2 hours before she arrived.', translated: 'Tôi đã chờ suốt 2 tiếng trước khi cô ấy đến.', highlight: 'had been waiting' }], usage: 'Nhấn mạnh quá trình, thời gian diễn ra của hành động trước một hành động quá khứ khác.', templates: [
      ['I had ___ waiting for 2 hours before the bus arrived.', 'been', 'had been.', 'They had been ___ for hours before the deal was struck.', ['talk', 'talked', 'talking', 'talks'], 2, 'had been + Ving.'],
      ['He had been ___ there for 3 years before he quit.', 'working', 'had been + Ving.', 'We ___ been running, so we were very tired.', ['have', 'had', 'has', 'was'], 1, 'had been.'],
      ['She was exhausted because she ___ been studying all night.', 'had', 'had been.', 'The ground was wet. It had been ___.', ['rain', 'rained', 'raining', 'rains'], 2, 'Tính liên tục của nguyên nhân.'],
      ['How long ___ you been waiting when she came?', 'had', 'Câu hỏi.', '___ he been drinking before he drove?', ['Has', 'Had', 'Was', 'Did'], 1, 'Had he been...'],
      ['They hadn\'t been ___ enough attention.', 'paying', 'hadn\'t been + Ving.', 'I was out of breath. I had been ___.', ['run', 'running', 'ran', 'runs'], 1, 'Nhấn mạnh quá trình.'],
      ['She ___ been feeling well for days before she saw a doctor.', 'had', 'had been.', 'We had been ___ for an hour when it began to rain.', ['hike', 'hiked', 'hiking', 'hikes'], 2, 'had been + Ving.'],
      ['He lost weight because he had been ___ to the gym.', 'going', 'had been + Ving.', 'The children had been ___ all day, so they fell asleep quickly.', ['play', 'played', 'playing', 'plays'], 2, 'had been + Ving.'],
      ['I gave up. I had been ___ to fix it for hours.', 'trying', 'had been + Ving.', 'Before the exam, she had been ___ non-stop.', ['prepare', 'prepared', 'preparing', 'prepares'], 2, 'had been + Ving.']
  ]},
  { name: 'Tương lai đơn', eng: 'Future Simple', desc: 'Quyết định tức thời, dự đoán, hứa hẹn', form: 'S + will + V', markers: ['tomorrow', 'next', 'in + thời gian tới', 'think', 'believe', 'hope'], examples: [{ text: 'I will help you.', translated: 'Tôi sẽ giúp bạn.', highlight: 'will help' }], usage: 'Một hành động sẽ xảy ra trong tương lai không dự định trước, quyết định tại lúc nói hoặc dựa dẫm vào quan điểm cá nhân.', templates: [
      ['I ___ call you tomorrow.', 'will', 'will + V.', 'She ___ come to the party next week.', ['will', 'is', 'does', 'has'], 0, 'will + V.'],
      ['They will ___ early.', 'arrive', 'will + V nguyên mẫu.', 'We will ___ a new house next year.', ['buying', 'bought', 'buy', 'buys'], 2, 'will + V.'],
      ['I think it ___ rain tomorrow.', 'will', 'Dự đoán bằng think.', 'I promise I ___ not tell anyone.', ['will', 'am', 'do', 'have'], 0, 'Lời hứa = promise.'],
      ['She won\'t ___ to the meeting.', 'come', 'won\'t + V.', 'They ___ not win the match.', ['will', 'do', 'are', 'have'], 0, 'will not.'],
      ['___ you help me with this?', 'Will', 'Câu hỏi.', '___ they arrive on time?', ['Do', 'Are', 'Will', 'Have'], 2, 'Will they.'],
      ['I will ___ you the money.', 'give', 'will + V.', 'The train ___ depart at 5 PM.', ['will', 'does', 'is', 'has'], 0, 'will.'],
      ['Maybe she ___ be there.', 'will', 'Maybe -> dự đoán tương lai.', 'I hope you ___ pass the exam.', ['are', 'do', 'have', 'will'], 3, 'Hope + will.'],
      ['I am cold. I ___ close the window.', 'will', 'Quyết định tức thời.', 'Hold on. I ___ open the door for you.', ['will', 'am', 'do', 'have'], 0, 'Quyết định tức thời.']
  ]},
  { name: 'Tương lai tiếp diễn', eng: 'Future Continuous', desc: 'Hành động sẽ đang xảy ra tại một thời điểm tương lai', form: 'S + will + be + V-ing', markers: ['at + giờ + tomorrow', 'at this time next', 'when/while + HTĐ'], examples: [{ text: 'I will be sleeping at 10 PM tonight.', translated: 'Tôi sẽ đang ngủ lúc 10 giờ tối nay.', highlight: 'will be sleeping' }], usage: 'Hành động dự kiến đang diễn ra tại một thời điểm cụ thể trong tương lai.', templates: [
      ['I will ___ sleeping at 11 PM tonight.', 'be', 'will be Ving.', 'At this time tomorrow, they ___ traveling.', ['will be', 'are', 'were', 'will'], 0, 'will be.'],
      ['She will be ___ when you arrive.', 'working', 'will be + V-ing.', 'We will be ___ lunch at 12 PM.', ['have', 'having', 'had', 'has'], 1, 'will be Ving.'],
      ['Tomorrow morning, I ___ be flying to Paris.', 'will', 'will be.', 'Next Sunday at 8 AM, he ___ taking an exam.', ['will be', 'is', 'was', 'will'], 0, 'will be Ving.'],
      ['Don\'t call me at 9. I will be ___ TV.', 'watching', 'will be Ving.', 'They won\'t be ___ at that time.', ['play', 'playing', 'played', 'plays'], 1, 'won\'t be Ving.'],
      ['___ you be staying here long?', 'Will', 'Câu hỏi.', 'Will she ___ waiting for us?', ['be', 'is', 'was', 'are'], 0, 'Will she be.'],
      ['I will be ___ from home tomorrow.', 'working', 'will be Ving.', 'The band will be ___ in the park tonight.', ['perform', 'performing', 'performed', 'performs'], 1, 'will be Ving.'],
      ['When you reach the station, I will be ___ for you.', 'waiting', 'will be Ving.', 'This time next week, we will be ___ on the beach.', ['lie', 'lying', 'lay', 'lain'], 1, 'will be Ving.'],
      ['I won\'t be ___ the car tomorrow.', 'using', 'won\'t be Ving.', 'They will be ___ a party on Friday night.', ['have', 'having', 'had', 'has'], 1, 'will be Ving.']
  ]},
  { name: 'Tương lai hoàn thành', eng: 'Future Perfect', desc: 'Hành động sẽ hoàn tất trước điểm tương lai', form: 'S + will + have + V3/ed', markers: ['by + mốc thời gian tương lai', 'by the time + HTĐ', 'before + HTĐ'], examples: [{ text: 'I will have finished the report by tomorrow.', translated: 'Tôi sẽ hoàn thành báo cáo trước ngày mai.', highlight: 'will have finished' }], usage: 'Hành động sẽ được hoàn tất trước một thời điểm cụ thể hoặc trước một hành động khác trong tương lai.', templates: [
      ['I will ___ finished by 5 PM.', 'have', 'will have V3.', 'By tomorrow, she will have ___.', ['arrive', 'arrived', 'arriving', 'arrives'], 1, 'will have + V3.'],
      ['They will have ___ the house by next month.', 'built', 'will have V3.', 'We ___ have completed the project by the deadline.', ['will', 'are', 'do', 'have'], 0, 'will have.'],
      ['By the time you return, I will have ___.', 'left', 'will have V3.', 'He won\'t have ___ the book by tomorrow.', ['read', 'reading', 'readed', 'reads'], 0, 'won\'t have + V3.'],
      ['___ you have eaten by 7 PM?', 'Will', 'Câu hỏi.', 'Will they ___ arrived by then?', ['have', 'has', 'had', 'be'], 0, 'Will they have.'],
      ['By next year, I will have ___ here for 5 years.', 'lived', 'will have V3.', 'By the end of the day, we will have ___ 10 miles.', ['walk', 'walked', 'walking', 'walks'], 1, 'will have V3.'],
      ['She will have ___ a lot of money by the time she retires.', 'saved', 'will have V3.', 'I will have ___ my homework before dinner.', ['do', 'done', 'doing', 'did'], 1, 'will have V3.'],
      ['By 2025, they will have ___ the new bridge.', 'opened', 'will have V3.', 'We will have ___ ready before the guests arrive.', ['get', 'got', 'gotten', 'getting'], 2, 'will have gotten/got.'],
      ['How many pages will you have ___ by 8?', 'read', 'will have V3.', 'By Monday, he will have ___ his mind.', ['make', 'made', 'making', 'makes'], 1, 'will have made up.']
  ]},
  { name: 'Tương lai hoàn thành tiếp diễn', eng: 'Future Perfect Continuous', desc: 'Quá trình dài tới mốc điểm tương lai', form: 'S + will + have + been + V-ing', markers: ['by the time + HTĐ', 'for + khoảng thời gian', 'by + mốc thời gian'], examples: [{ text: 'By next year, I will have been working here for 5 years.', translated: 'Tới năm sau, tôi sẽ làm việc ở đây được 5 năm.', highlight: 'will have been working' }], usage: 'Nhấn mạnh tính liên tục khoảng thời gian một hành động sẽ kéo dài cho đến mốc ở tương lai.', templates: [
      ['By tomorrow, I will have ___ working for 10 hours.', 'been', 'will have been Ving.', 'By next year, she will have been ___ English for 4 years.', ['learn', 'learned', 'learning', 'learns'], 2, 'will have been Ving.'],
      ['They will have been ___ for 5 years by next April.', 'dating', 'will have been Ving.', 'We ___ have been living here for 10 years by 2030.', ['will', 'are', 'do', 'have'], 0, 'will have been.'],
      ['By the time he retires, he will have been ___ for 30 years.', 'teaching', 'will have been Ving.', 'You will have been ___ all day by the time I get home.', ['study', 'studying', 'studied', 'studies'], 1, 'will have been Ving.'],
      ['Will you have been ___ for me for over an hour by then?', 'waiting', 'Câu hỏi.', 'Will they ___ been traveling all night?', ['have', 'has', 'had', 'be'], 0, 'Will they have been.'],
      ['By midnight, I will have been ___ for 10 hours.', 'driving', 'will have been Ving.', 'He won\'t have been ___ long before the meeting starts.', ['wait', 'waiting', 'waited', 'waits'], 1, 'won\'t have been Ving.'],
      ['How long will you have been ___ violin by the end of this year?', 'playing', 'will have been Ving.', 'By the end of the month, we will have been ___ on this for 6 weeks.', ['work', 'working', 'worked', 'works'], 1, 'will have been Ving.'],
      ['She will have been ___ to lose weight for a year by next month.', 'trying', 'will have been Ving.', 'We will have been ___ side by side for a decade soon.', ['fight', 'fighting', 'fought', 'fights'], 1, 'will have been Ving.'],
      ['By the time the movie ends, I will have been ___ for 2 hours.', 'sitting', 'will have been Ving.', 'By next week, he will have been ___ his medicine for a month.', ['take', 'taking', 'taken', 'takes'], 1, 'will have been Ving.']
  ]}
];

function pair(fillText, fillAnswer, fillExplanation, mcqText, options, correctIndex, mcqExplanation) {
  return { fill: { text: fillText, answer: fillAnswer, explanation: fillExplanation }, mcq: { text: mcqText, options, correctIndex, explanation: mcqExplanation } };
}

const lessons = tenses.map((t, i) => {
  const pairs = t.templates.map(tmp => pair(
    `${t.name} - ${tmp[0]}`, tmp[1], tmp[2],
    `${t.name} - ${tmp[3]}`, tmp[4], tmp[5], tmp[6]
  ));

  return {
    title: t.name,
    short: t.eng,
    topic: 'Các thì (Tenses)',
    order: i + 1,
    engTitle: t.eng,
    description: t.desc,
    sections: [
      { id: 1, title: 'Cách sử dụng', type: 'usage', items: [{ icon: 'book-open-page-variant', title: 'Ý nghĩa', description: t.usage, example: t.examples[0].text }] },
      { id: 2, title: 'Cấu trúc', type: 'formula', formula: t.form, examples: t.examples },
      { id: 3, title: 'Dấu hiệu nhận biết', type: 'markers', groups: [{ title: 'Dấu hiệu', items: t.markers }] }
    ],
    pairs
  };
});

fs.writeFileSync(path.join(__dirname, 'tenses_lessons.js'), `module.exports = ${JSON.stringify(lessons, null, 2)};`, 'utf8');
