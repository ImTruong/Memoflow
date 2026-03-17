import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions, 
  Keyboard, 
  Animated,
  ScrollView,
  Easing,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { flashcardApi } from '../api/flashcardApi';
import { WordResponse } from '../types/flashcard';
import { API_BASE_URL } from '../api/apiClient';
import { Audio } from 'expo-av';
import { StudyCompletionOverlay } from '../components/StudyCompletionOverlay';

const { width, height } = Dimensions.get('window');

type FillBlankGameScreenProps = {
  onBack: () => void;
  setName: string;
  lessonId: number;
};

// Simple Firework Particle Component
const Particle = ({ delay, color }: { delay: number, color: string }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const x = useRef(Math.random() * 250 - 125).current;
  const y = useRef(Math.random() * -250 - 50).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const opacity = anim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 1, 0]
  });

  return (
    <Animated.View 
      style={[
        styles.particle, 
        { 
          opacity,
          transform: [
            { translateX: Animated.multiply(anim, x) },
            { translateY: Animated.multiply(anim, y) },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2] }) }
          ],
          backgroundColor: color
        }
      ]} 
    />
  );
};

export const FillBlankGameScreen: React.FC<FillBlankGameScreenProps> = ({ onBack, setName, lessonId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState<WordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [isGameFinished, setIsGameFinished] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const correctOpacity = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        const res = await flashcardApi.getLessonWords(lessonId, 0, 100);
        if (res.success && res.data.content) {
          setCards(res.data.content);
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu game.');
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [lessonId]);

  const currentWord = cards.length > 0 ? cards[currentIndex % cards.length] : null;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(errorOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(errorOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const playSound = async () => {
    if (currentWord?.audioUrl) {
      try {
        const url = currentWord.audioUrl.startsWith('http') 
          ? currentWord.audioUrl 
          : `${API_BASE_URL}${currentWord.audioUrl.startsWith('/') ? '' : '/'}${currentWord.audioUrl}`;
        const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
        });
      } catch (error) { console.log('Error playing sound:', error); }
    }
  };

  const handleTextChange = (text: string) => {
    setUserInput(text.toUpperCase());
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    if (!currentWord) return;
    
    if (userInput.trim().toUpperCase() === currentWord.name.trim().toUpperCase()) {
      setIsCorrect(true);
      const points = attempts === 0 ? 100 : 50;
      setScore(prev => prev + points);
      setShowFireworks(true);
      Animated.timing(correctOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      Keyboard.dismiss();
    } else {
      setIsCorrect(false);
      triggerShake();
      setAttempts(prev => prev + 1);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setIsGameFinished(true), 1000);
      }
    }
  };

  const handleContinue = () => {
    if (currentIndex === cards.length - 1) {
      setIsGameFinished(true);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setUserInput('');
    setIsCorrect(null);
    setShowHint(false);
    setShowFireworks(false);
    setAttempts(0);
    Animated.timing(correctOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(() => inputRef.current?.focus(), 500);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#5B62E3" />
      </View>
    );
  }

  if (cards.length === 0 || !currentWord) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#6B7280', fontSize: 16 }}>Bộ thẻ này chưa có từ vựng nào để chơi.</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#EEF2FF', borderRadius: 12 }}>
          <Text style={{ color: '#4F46E5', fontWeight: 'bold' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const termArray = currentWord.name.split('');

  return (
    <View style={styles.container}>
      {/* Background Layer 1: Normal (Blue theme) */}
      <LinearGradient
        colors={['#BAE6FD', '#F8FAFC']} // Light blue/turquoise to nearly white
        style={StyleSheet.absoluteFill}
      />

      {/* Background Layer 2: Correct (Emerald theme) */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: correctOpacity }]}>
        <LinearGradient
          colors={['#A7F3D0', '#F0FDF4']} // Light emerald to nearly white green
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Background Layer 3: Error (Red theme) */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: errorOpacity, backgroundColor: '#FECACA' }]} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerBadge}>
              <Ionicons name="heart" size={16} color={lives >= 1 ? "#EF4444" : "#E5E7EB"} />
              <Ionicons name="heart" size={16} color={lives >= 2 ? "#EF4444" : "#E5E7EB"} />
              <Ionicons name="heart" size={16} color={lives >= 3 ? "#EF4444" : "#E5E7EB"} />
            </View>
            <View style={styles.headerBadge}>
              <MaterialCommunityIcons name="trophy" size={16} color="#FACC15" />
              <Text style={styles.scoreText}>{score}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleContinue} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>{currentIndex + 1}/{cards.length}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / cards.length) * 100}%` }]} />
            </View>
          </View>

          <Animated.View style={[styles.mainContent, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={styles.card}>
              <View style={styles.imageContainer}>
                {currentWord?.imageUrl ? (
                  <Image source={{ uri: currentWord.imageUrl }} style={styles.cardImage} />
                ) : (
                   <View style={[styles.cardImage, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                     <Ionicons name="image-outline" size={48} color="#D1D5DB" />
                   </View>
                )}
                {isCorrect === true && (
                  <View style={styles.correctOverlay}>
                    <View style={styles.checkIconBg}>
                      <Ionicons name="checkmark" size={40} color="#FFF" />
                    </View>
                    {showFireworks && Array.from({ length: 50 }).map((_, i) => (
                      <Particle 
                        key={i} 
                        delay={i * 15} 
                        color={`hsl(${Math.random() * 360}, 80%, 60%)`}
                      />
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.cardInfo}>
                <Text style={styles.categoryLabel}>{setName}</Text>
                <View style={styles.phoneticRow}>
                  <Text style={styles.phoneticValue}>{currentWord?.ipa || ''}</Text>
                  <TouchableOpacity style={styles.soundIconButton} onPress={playSound}>
                    <Ionicons name="volume-high" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.meaningTag}>
                  <Text style={styles.meaningLabel}>{currentWord?.definition}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              activeOpacity={1} 
              onPress={() => inputRef.current?.focus()} 
              style={styles.inputArea}
            >
              <View style={styles.lettersWrapper}>
                {termArray.map((letter, index) => {
                  const char = userInput[index] || '';
                  const active = userInput.length === index && !isCorrect;
                  const wrong = isCorrect === false && char !== '' && index < userInput.length;
                  const correct = isCorrect === true;

                  return (
                    <View 
                      key={index} 
                      style={[
                        styles.letterCircle,
                        char !== '' && styles.letterCircleFilled,
                        active && styles.letterCircleActive,
                        correct && styles.letterCircleCorrect,
                        wrong && styles.letterCircleWrong
                      ]}
                    >
                      <Text style={styles.letterChar}>{char}</Text>
                    </View>
                  );
                })}
              </View>
              
              {isCorrect === false && (
                <View style={styles.wrongLabelContainer}>
                  <View style={styles.wrongLabel}>
                    <Text style={styles.wrongLabelText}>Thử lại nhé!</Text>
                    <View style={styles.wrongArrow} />
                  </View>
                </View>
              )}

              {showHint && !isCorrect && (
                <View style={styles.hintBadge}>
                  <MaterialCommunityIcons name="lightbulb-variant" size={14} color="#F97316" />
                  <Text style={styles.hintValue}>Gợi ý: {currentWord?.name[userInput.length]}</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.bottomActions}>
              {isCorrect === true ? (
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                  <Text style={styles.continueButtonText}>Tiếp tục</Text>
                  <Ionicons name="arrow-forward" size={24} color="#FFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              ) : (
                <View style={styles.dualButtons}>
                  <TouchableOpacity style={styles.hintIconButton} onPress={() => setShowHint(true)}>
                    <Ionicons name="bulb" size={20} color="#F59E0B" />
                    <Text style={styles.hintIconText}>Hint</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.checkAnswerButton, !userInput && styles.disabledButton]} 
                    onPress={checkAnswer}
                    disabled={!userInput}
                  >
                    <Text style={styles.checkAnswerText}>Check Answer</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Large bottom spacer to ensure scrolling above keyboard */}
          <View style={{ height: 350 }} />
        </ScrollView>

        <TextInput
          ref={inputRef}
          style={styles.hiddenTextInput}
          value={userInput}
          onChangeText={handleTextChange}
          autoCapitalize="characters"
          maxLength={currentWord?.name.length || 0}
          autoFocus={true}
          blurOnSubmit={false}
        />
      </KeyboardAvoidingView>

      <StudyCompletionOverlay 
        isVisible={isGameFinished} 
        onClose={onBack} 
        type={lives <= 0 ? 'loss' : 'win'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 70,
    zIndex: 10,
  },
  skipBtn: {
    padding: 10,
    width: 60,
  },
  skipText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  headerCenter: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    gap: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollContent: {
    paddingTop: 10,
  },
  progressSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 15,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 6,
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 4,
  },
  mainContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 15,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  correctOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    borderWidth: 5,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardInfo: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phoneticValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 10,
  },
  soundIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meaningTag: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  meaningLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  inputArea: {
    width: '100%',
    marginTop: 35,
    alignItems: 'center',
  },
  lettersWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  letterCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  letterCircleFilled: {
    borderColor: '#CBD5E1',
  },
  letterCircleActive: {
    borderColor: '#0EA5E9', // Sky blue active border
    borderWidth: 3,
  },
  letterCircleCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  letterCircleWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  letterChar: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  wrongLabelContainer: {
    position: 'absolute',
    top: -45,
  },
  wrongLabel: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  wrongLabelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  wrongArrow: {
    position: 'absolute',
    bottom: -4,
    width: 10,
    height: 10,
    backgroundColor: '#EF4444',
    transform: [{ rotate: '45deg' }],
  },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  hintValue: {
    fontSize: 14,
    color: '#EA580C',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  bottomActions: {
    width: '100%',
    marginTop: 40,
    marginBottom: 20,
  },
  continueButton: {
    width: '100%',
    height: 64,
    backgroundColor: '#22C55E',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  continueButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dualButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  hintIconButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#FEF9C3',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  hintIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D97706',
    marginLeft: 6,
  },
  checkAnswerButton: {
    flex: 2,
    height: 60,
    backgroundColor: '#0EA5E9', // Premium blue
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkAnswerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  hiddenTextInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
});
