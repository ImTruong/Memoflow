import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
// (Keep or adjust imports as needed)
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { LearningLesson } from '../types/story';
import { BotDifficulty, WordRaceLessonContent } from '../types/wordRace';
import { WordRaceMessage } from '../types/wordRace';

const { width } = Dimensions.get('window');

interface WordRaceGameScreenProps {
  lesson: LearningLesson;
  difficulty: BotDifficulty;
  onBack: () => void;
  onComplete: (score: number) => void;
}

const getDifficultyLabel = (difficulty: BotDifficulty) => {
  switch (difficulty) {
    case 'EASY': return 'Dễ';
    case 'MEDIUM': return 'Trung bình';
    case 'HARD': return 'Khó';
    default: return difficulty;
  }
};

const getMaxWordLengthByDifficulty = (difficulty: BotDifficulty): number => {
  switch (difficulty) {
    case 'EASY':
      return 4;
    case 'MEDIUM':
      return 6;
    case 'HARD':
      return 8;
    default:
      return 8;
  }
};

export const WordRaceGameScreen: React.FC<WordRaceGameScreenProps> = ({ lesson, difficulty, onBack, onComplete }) => {
  const config = (lesson.content || {}) as WordRaceLessonContent;
  const targetScore = Number(config.targetScore) || 40;
  const timeLimit = Number(config.timeLimit) || 15;
  const maxWordLength = getMaxWordLengthByDifficulty(difficulty);
  const forbiddenEndings = Array.isArray(config.forbiddenEndings)
    ? config.forbiddenEndings.map((ending) => ending.toLowerCase())
    : undefined;

  // --- Game State ---
  const [messages, setMessages] = useState<WordRaceMessage[]>([]);
  const [userScore, setUserScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [nextLetter, setNextLetter] = useState<string>('');
  const [turn, setTurn] = useState<'USER' | 'BOT'>('USER');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  
  // --- UI/UX State ---
  const [showExitModal, setShowExitModal] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [gameResult, setGameResult] = useState<'VICTORY' | 'DEFEAT' | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // --- Scroll Fix ---
  useEffect(() => {
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages, isBotThinking]);

  // --- Timer Logic ---
  useEffect(() => {
    if (isGameEnded || isBotThinking || turn === 'BOT') return;

    if (timeLeft <= 0) {
      handleBotTurnStart(nextLetter || 'a'); 
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isGameEnded, isBotThinking, turn, nextLetter]);

  // --- Logic ---
  
  // Kiem tra tu user nhap theo luat game va Dictionary API.
  const validateWord = async (word: string) => {
    if (word.length < 2) return { valid: false, reason: "Từ quá ngắn!" };
    
    // Check next letter rule
    if (nextLetter && word[0].toLowerCase() !== nextLetter.toLowerCase()) {
      return { valid: false, reason: `Phải bắt đầu bằng chữ '${nextLetter.toUpperCase()}'!` };
    }

    // Check used words
    if (messages.find(m => m.word.toLowerCase() === word.toLowerCase())) {
      return { valid: false, reason: "Từ đã được sử dụng!" };
    }

    // Check forbidden endings
    if (forbiddenEndings) {
      const lastChar = word[word.length - 1].toLowerCase();
      if (forbiddenEndings.includes(lastChar)) {
        return { valid: false, reason: `Không được kết thúc bằng chữ '${lastChar.toUpperCase()}'!` };
      }
    }

    // API ngoai: Dictionary API xac thuc tu tieng Anh co ton tai.
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      if (response.ok) return { valid: true };
      return { valid: false, reason: "Từ này không tồn tại!" };
    } catch (error) {
       return { valid: true }; // Fallback
    }
  };

  const addMessage = (sender: 'USER' | 'BOT', word: string) => {
    if (isGameEnded) return;

    const score = word.length;
    const newMessage: WordRaceMessage = {
      id: Math.random().toString(),
      sender,
      word,
      score,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    if (sender === 'USER') {
      const newScore = userScore + score;
      setUserScore(newScore);
      if (newScore >= targetScore) {
        endGame('VICTORY');
        return;
      }
    } else {
      const newScore = botScore + score;
      setBotScore(newScore);
      if (newScore >= targetScore) {
        endGame('DEFEAT');
        return;
      }
    }
    
    setNextLetter(word[word.length - 1].toLowerCase());
    setTimeLeft(timeLimit);
  };

  const handleUserSubmit = async () => {
    if (!inputText.trim() || isBotThinking || isGameEnded || turn === 'BOT') return;
    
    const fullWord = inputText.trim().toLowerCase();
    
    const validation = await validateWord(fullWord);
    
    if (validation.valid) {
      addMessage('USER', fullWord);
      setInputText('');
      if (!isGameEnded && userScore + fullWord.length < targetScore) {
        handleBotTurnStart(fullWord[fullWord.length - 1]);
      }
    } else {
      setErrorMessage(validation.reason || "Từ không hợp lệ!");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 2000);
    }
  };

  const handleBotTurnStart = (letter: string) => {
    if (isGameEnded) return;
    setTurn('BOT');
    startBotTurn(letter);
  };

  // Bot goi Datamuse de tim tu bat dau bang chu cai can noi tiep.
  const startBotTurn = async (letter: string) => {
    setIsBotThinking(true);
    
    const thinkingTime = difficulty === 'HARD' ? 800 : (difficulty === 'MEDIUM' ? 1500 : 2500);
    await new Promise(r => setTimeout(r, thinkingTime));
    
    if (isGameEnded) {
       setIsBotThinking(false);
       return;
    }

    try {
      // API ngoai: Datamuse tra ve danh sach tu theo pattern chu cai dau.
      const response = await fetch(`https://api.datamuse.com/words?sp=${letter}*&max=100`);
      const data = await response.json();
      
      let possibleWords = data.filter((w: any) => {
        const wordStr = w.word;
        if (wordStr.length < 3) return false;
        if (wordStr.length > maxWordLength) return false;
        if (messages.find(m => m.word.toLowerCase() === wordStr.toLowerCase())) return false;
        if (forbiddenEndings) {
          if (forbiddenEndings.includes(wordStr[wordStr.length - 1].toLowerCase())) return false;
        }

        return true;
      });

      if (possibleWords.length === 0) {
        possibleWords = data.slice(0, 5); 
      }

      if (possibleWords.length > 0 && !isGameEnded) {
        // Sort by difficulty
        if (difficulty === 'HARD') {
          possibleWords.sort((a: any, b: any) => b.word.length - a.word.length);
        } else if (difficulty === 'EASY') {
          possibleWords.sort((a: any, b: any) => a.word.length - b.word.length);
        }

        const botWord = possibleWords[Math.floor(Math.random() * Math.min(3, possibleWords.length))].word;
        addMessage('BOT', botWord);
        setTurn('USER');
      } else {
        setTurn('USER');
      }
    } catch (error) {
      if (!isGameEnded) {
        addMessage('BOT', letter + "apple");
        setTurn('USER');
      }
    } finally {
      setIsBotThinking(false);
    }
  };

  const endGame = (result: 'VICTORY' | 'DEFEAT') => {
    setGameResult(result);
    setIsGameEnded(true);
    setTurn('USER'); // Stop bot
    setShowResultModal(true);
    if (result === 'VICTORY') onComplete(userScore);
  };

  // --- Render Functions ---

  const renderMessage = ({ item: msg }: { item: WordRaceMessage }) => (
    <View 
      style={[
        styles.messageWrapper, 
        msg.sender === 'USER' ? styles.userMsgWrapper : styles.botMsgWrapper
      ]}
    >
      {msg.sender === 'BOT' && (
        <Image source={{ uri: "https://api.dicebear.com/7.x/bottts/png?seed=Robo" }} style={styles.msgAvatar} />
      )}
      
      <View style={[styles.msgBubble, msg.sender === 'USER' ? styles.userBubble : styles.botBubble]}>
        <Text style={styles.msgText}>
          {msg.sender === 'USER' ? (
             <><Text style={{ color: colors.primary, fontWeight: 'bold' }}>{msg.word[0]}</Text>{msg.word.slice(1)}</>
          ) : (
            <>{msg.word.slice(0, -1)}<Text style={{ color: colors.primary, fontWeight: 'bold' }}>{msg.word.slice(-1)}</Text></>
          )}
        </Text>
      </View>
      
      <Text style={styles.msgPoints}>+{msg.score}</Text>

      {msg.sender === 'USER' && (
        <Image source={{ uri: "https://api.dicebear.com/7.x/avataaars/png?seed=Felix" }} style={styles.msgAvatar} />
      )}
    </View>
  );

  const renderFooter = () => {
    if (isBotThinking) {
      return (
        <View style={styles.botMsgWrapper}>
          <Image source={{ uri: "https://api.dicebear.com/7.x/bottts/png?seed=Robo" }} style={styles.msgAvatar} />
          <View style={[styles.msgBubble, styles.botBubble, { paddingVertical: 12 }]}>
             <ActivityIndicator size="small" color={colors.primary} />
          </View>
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => (
    <View style={styles.emptyGame}>
      <MaterialCommunityIcons name="robot" size={64} color="#E5E7EB" />
      <Text style={styles.emptyText}>Mời bạn nhập một từ tiếng Anh để bắt đầu!</Text>
    </View>
  );

  const canSend = turn === 'USER' && !isBotThinking && inputText.trim().length > 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => isGameEnded ? onBack() : setShowExitModal(true)} style={styles.backButton}>
           <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
        {isGameEnded ? (
           <TouchableOpacity onPress={() => setShowResultModal(true)} style={styles.resultBadgeSmall}>
              <Ionicons name="trophy" size={20} color={gameResult === 'VICTORY' ? '#F59E0B' : '#9333EA'} />
           </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      {/* Score HUD */}
      <View style={styles.scoreHud}>
        <View style={styles.botScoreBox}>
          <View>
            <Text style={[styles.scoreValue, { color: '#EF4444' }]}>{botScore}</Text>
            {turn === 'BOT' && (
              <View style={styles.timerContainer}>
                <ActivityIndicator size="small" color="#EF4444" />
              </View>
            )}
          </View>
          <Image 
            source={{ uri: "https://api.dicebear.com/7.x/bottts/png?seed=Robo" }} 
            style={styles.avatar} 
          />
        </View>
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>vs</Text>
          <View style={styles.vsDot} />
        </View>
        <View style={styles.userScoreBox}>
          <Image 
            source={{ uri: "https://api.dicebear.com/7.x/avataaars/png?seed=Felix" }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.scoreValue}>{userScore}</Text>
            {turn === 'USER' && (
              <View style={styles.timerContainer}>
                <Ionicons name="timer-outline" size={12} color={timeLeft < 5 ? "#EF4444" : "#10B981"} />
                <Text style={[styles.timerText, { color: timeLeft < 5 ? "#EF4444" : "#10B981" }]}>
                  {timeLeft}s
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.goalBanner}>
        <Text style={styles.goalText}>Số điểm cần đạt: {targetScore}</Text>
      </View>

      {/* Message Area */}
      <FlatList 
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.chatArea}
        contentContainerStyle={styles.chatScrollContent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Area */}
      {!isGameEnded && (
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={[styles.inputWrapper, turn === 'BOT' && { opacity: 0.5 }]}>
              <TextInput 
                style={styles.input}
                placeholder={turn === 'BOT' ? "Đang chờ Bot..." : (nextLetter ? `Bắt đầu bằng '${nextLetter.toUpperCase()}'...` : "Nhập từ để bắt đầu...")}
                value={inputText}
                onChangeText={setInputText}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleUserSubmit}
                placeholderTextColor="#9CA3AF"
                editable={turn === 'USER' && !isBotThinking}
              />
            </View>
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                canSend ? styles.sendButtonActive : styles.sendButtonIdle,
              ]} 
              onPress={handleUserSubmit}
              disabled={!canSend}
            >
              <Ionicons name="arrow-up" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <View style={styles.errorToast}>
           <View style={styles.errorIconBg}>
              <Ionicons name="warning" size={20} color="#EF4444" />
           </View>
           <Text style={styles.errorText}>{errorMessage}</Text>
           <TouchableOpacity onPress={() => setShowErrorToast(false)}>
              <Ionicons name="close" size={20} color="#FCA5A5" />
           </TouchableOpacity>
        </View>
      )}

      {/* End Game Modal */}
      <Modal visible={showResultModal} transparent={true} statusBarTranslucent animationType="fade">
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <View style={[styles.resultBadge, { backgroundColor: gameResult === 'VICTORY' ? '#FEF3C7' : '#F3E8FF' }]}>
               <FontAwesome5 
                  name={gameResult === 'VICTORY' ? "trophy" : "skull-crossbones"} 
                  size={60} 
                  color={gameResult === 'VICTORY' ? '#F59E0B' : '#9333EA'} 
               />
            </View>
            
            <Text style={[styles.resultStatus, { color: gameResult === 'VICTORY' ? '#F59E0B' : '#9333EA' }]}>
               {gameResult === 'VICTORY' ? 'CHIẾN THẮNG!' : 'THẤT BẠI...'}
            </Text>

            <View style={styles.levelBadge}>
               <Text style={styles.levelText}>Cấp độ: {getDifficultyLabel(difficulty)}</Text>
            </View>

            <View style={styles.resultScoreRow}>
              <View style={styles.resultScoreBox}>
                <Image source={{ uri: "https://api.dicebear.com/7.x/avataaars/png?seed=Felix" }} style={styles.resultAvatar} />
                <Text style={styles.resultScoreLabel}>BẠN</Text>
                <Text style={styles.resultScoreValue}>{userScore}</Text>
              </View>
              <View style={styles.resultVs}>
                <Text style={styles.resultVsText}>-</Text>
              </View>
              <View style={styles.resultScoreBox}>
                <Image source={{ uri: "https://api.dicebear.com/7.x/bottts/png?seed=Robo" }} style={styles.resultAvatar} />
                <Text style={styles.resultScoreLabel}>BOT</Text>
                <Text style={[styles.resultScoreValue, { color: '#EF4444' }]}>{botScore}</Text>
              </View>
            </View>

            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={onBack}>
                <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="exit-outline" size={24} color="#EF4444" />
                </View>
                <Text style={styles.actionText}>Thoát</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionBtn, styles.mainAction]} onPress={() => {
                setMessages([]);
                setUserScore(0);
                setBotScore(0);
                setGameResult(null);
                setIsGameEnded(false);
                setShowResultModal(false);
                setNextLetter('');
                setInputText('');
                setIsBotThinking(false);
                setTimeLeft(timeLimit);
                setTurn('USER');
              }}>
                <View style={styles.mainActionIcon}>
                  <Ionicons name="refresh" size={32} color="#FFF" />
                </View>
                <Text style={[styles.actionText, { color: '#1F2937', fontWeight: 'bold' }]}>Chơi lại</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => setShowResultModal(false)}>
                <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="eye-outline" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.actionText}>Xem lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exit Confirm Modal */}
      <Modal visible={showExitModal} transparent={true} statusBarTranslucent animationType="fade">
        <View style={styles.exitOverlay}>
          <View style={styles.exitCard}>
            <View style={styles.pauseIconBox}>
               <Ionicons name="pause" size={40} color={colors.primary} />
            </View>
            <Text style={styles.exitTitle}>Bạn có chắc muốn rời đi?</Text>
            <Text style={styles.exitSubtitle}>Tiến trình trận đấu hiện tại sẽ không được lưu.</Text>
            
            <TouchableOpacity 
              style={styles.continueBtn} 
              onPress={() => setShowExitModal(false)}
            >
              <Text style={styles.continueBtnText}>TIẾP TỤC CHƠI</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.leaveBtn} 
              onPress={onBack}
            >
              <Text style={styles.leaveBtnText}>RỜI GAME</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  scoreHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  userScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  vsContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  vsDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
    marginTop: 2,
  },
  botScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalBanner: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goalText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  chatScrollContent: {
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userMsgWrapper: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  botMsgWrapper: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  msgBubble: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: width * 0.7,
  },
  userBubble: {
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  botBubble: {
    backgroundColor: '#EFF6FF',
    marginLeft: 8,
  },
  msgText: {
    fontSize: 16,
    color: '#1F2937',
  },
  msgPoints: {
    fontSize: 12,
    color: '#9CA3AF',
    alignSelf: 'center',
    marginHorizontal: 8,
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  input: {
    flex: 1,
    fontSize: 18,
    color: '#1F2937',
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sendButtonActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  sendButtonIdle: {
    backgroundColor: '#FCA5A5',
    shadowColor: '#FCA5A5',
  },
  emptyGame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 200,
  },
  errorToast: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: '#FEF2F2',
    height: 60,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    gap: 12,
  },
  errorIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(55, 65, 81, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 40,
    padding: 24,
    alignItems: 'center',
  },
  resultBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  resultStatus: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  levelBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  levelText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  resultScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 30,
  },
  resultScoreBox: {
    alignItems: 'center',
  },
  resultAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  resultScoreLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  resultVs: {
    marginHorizontal: 20,
  },
  resultVsText: {
    fontSize: 24,
    color: '#D1D5DB',
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainAction: {
    transform: [{ translateY: -10 }],
  },
  mainActionIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  actionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  exitOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(55, 65, 81, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  exitCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  pauseIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  exitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  exitSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  leaveBtn: {
    width: '100%',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  leaveBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'center',
  },
  timerText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  resultBadgeSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
