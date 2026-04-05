import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { flashcardApi } from '../api/flashcardApi';
import { aiProviderApi } from '../api/aiProviderApi';
import { FlashcardReviewResponse } from '../types/flashcard';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

type AppliedExerciseScreenProps = {
  onBack: () => void;
};

type Exercise = {
  type: 'multiple_choice' | 'fill_blank';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  word: string;
};

export const AppliedExerciseScreen: React.FC<AppliedExerciseScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [userInput, setUserInput] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchWordsAndGenerateExercises();
  }, []);

  const fetchWordsAndGenerateExercises = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const res = await flashcardApi.getReviewHistory(today, 0, 50);
      
      if (res.success && res.data.content.length > 0) {
        const words = res.data.content.map(r => ({
          name: r.wordName,
          definition: r.wordDefinition
        }));
        
        await generateExercises(words);
      } else {
        setLoading(false);
        Alert.alert('Thông báo', 'Bạn chưa học từ vựng nào hôm nay để làm bài tập áp dụng.', [{ text: 'Quay lại', onPress: onBack }]);
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      setLoading(false);
      Alert.alert('Lỗi', 'Không thể lấy dữ liệu từ vựng hôm nay.');
    }
  };

  const generateExercises = async (words: { name: string, definition: string }[]) => {
    try {
      setGenerating(true);
      const wordsList = words.map(w => `${w.name} (${w.definition})`).join(', ');
      
      const prompt = `Generate 5 English exercises for these words: ${wordsList}.
      Types: multiple_choice (4 options) or fill_blank.
      Format: JSON ONLY.
      Structure: {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "answer": "A",
            "explanation": "GIẢI THÍCH CHI TIẾT: 1. Tại sao đáp án '${wordsList}' là đúng nhất trong ngữ cảnh này? 2. Tại sao các đáp án còn lại là sai (về ngữ pháp hoặc ý nghĩa)? Trình bày rõ ràng bằng tiếng Việt.",
            "word": "..."
          },
          {
            "type": "fill_blank", 
            "question": "Sentence with ___ for the word", 
            "answer": "The Word", 
            "explanation": "Giải thích ngữ cảnh và cách dùng của từ trong câu.", 
            "word": "..."
          }
        ]
      }
      Rule: The "answer" for multiple_choice must be one of the options. "fill_blank" question must have exactly one "___" where the word belongs.`;

      const aiResponse = await aiProviderApi.generateTutorReply(prompt, []);
      
      // Clean up AI response if it contains markdown code blocks
      let jsonStr = aiResponse.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.substring(3, jsonStr.length - 3);
      }

      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.exercises && Array.isArray(parsed.exercises)) {
          setExercises(parsed.exercises);
        } else if (parsed.response && typeof parsed.response === 'string') {
          // If the AI returned an object with a response field instead of exercises
          console.error('AI returned a message instead of exercises:', parsed.response);
          Alert.alert('AI Thông báo', parsed.response);
          onBack();
        } else {
          throw new Error('Invalid AI response format');
        }
      } catch (e) {
        console.error('Failed to parse AI JSON:', jsonStr);
        // If it's not JSON but our friendly fallback message
        if (jsonStr.includes('Minh dang ban')) {
          Alert.alert('AI Thông báo', 'Hệ thống AI đang bận. Vui lòng thử lại sau ít phút.');
        } else {
          Alert.alert('Lỗi', 'AI không thể tạo bộ đề phù hợp. Vui lòng thử lại sau.');
        }
        onBack();
      }
    } catch (error) {
      console.error('Error generating exercises:', error);
      Alert.alert('Lỗi', 'Không thể kết nối với AI để tạo bài tập.');
      onBack();
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleOptionPress = (option: string) => {
    if (isCorrect !== null) return;
    
    setSelectedOption(option);
    const currentExercise = exercises[currentIndex];
    const correct = option.toLowerCase().trim() === currentExercise.answer.toLowerCase().trim();
    setIsCorrect(correct);
    
    if (correct) {
      setScore((prev: number) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev: number) => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setUserInput('');
    } else {
      setFinished(true);
    }
  };

  const handleTextChange = (text: string) => {
    setUserInput(text);
    const currentExercise = exercises[currentIndex];
    if (text.trim().toLowerCase() === currentExercise.answer.trim().toLowerCase()) {
      setIsCorrect(true);
      setScore(prev => prev + 1);
    }
  };

  if (loading || generating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {generating ? 'AI đang biên soạn bài tập cho riêng bạn...' : 'Đang tải dữ liệu...'}
        </Text>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#EEF2FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
        <View style={styles.finishedWrapper}>
          <MaterialCommunityIcons name="trophy" size={80} color="#FACC15" />
          <Text style={styles.finishedTitle}>Hoàn thành!</Text>
          <Text style={styles.finishedScore}>Điểm của bạn: {score}/{exercises.length}</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Quay về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentExercise = exercises[currentIndex];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${((currentIndex + 1) / exercises.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{currentIndex + 1}/{exercises.length}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>Score: {score}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>
              {currentExercise.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Điền vào chỗ trống'}
            </Text>
          </View>
          
          <Text style={styles.questionText}>{currentExercise.question}</Text>
          
          {currentExercise.type === 'multiple_choice' && currentExercise.options && (
            <View style={styles.optionsContainer}>
              {currentExercise.options.map((option: string, index: number) => {
                const isSelected = selectedOption === option;
                const isCorrectOption = option.toLowerCase().trim() === currentExercise.answer.toLowerCase().trim();
                
                const getOptionStyle = () => {
                  const baseStyle: any[] = [styles.optionItem];
                  if (isCorrect !== null) {
                    if (isSelected) {
                      baseStyle.push(isCorrect ? styles.optionCorrect : styles.optionWrong);
                    } else if (isCorrectOption) {
                      baseStyle.push(styles.optionCorrect);
                    }
                  } else if (isSelected) {
                    baseStyle.push(styles.optionSelected);
                  }
                  return baseStyle;
                };

                return (
                  <TouchableOpacity 
                    key={index} 
                    style={getOptionStyle()}
                    onPress={() => handleOptionPress(option)}
                    disabled={isCorrect !== null}
                  >
                    <Text style={[
                      styles.optionText,
                      (isSelected || (isCorrect !== null && isCorrectOption)) && styles.optionTextActive
                    ]}>
                      {option}
                    </Text>
                    {isCorrect !== null && isCorrectOption && (
                      <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                    )}
                    {isCorrect === false && isSelected && (
                      <Ionicons name="close-circle" size={24} color="#FFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {currentExercise.type === 'fill_blank' && (
            <View style={styles.fillBlankContainer}>
              <TouchableOpacity 
                activeOpacity={1} 
                onPress={() => inputRef.current?.focus()} 
                style={styles.inputArea}
              >
                <View style={styles.lettersWrapper}>
                  {currentExercise.answer.split('').map((letter: string, index: number) => {
                    const char = userInput[index] || '';
                    const isFilled = char !== '';
                    const isActive = userInput.length === index && isCorrect === null;
                    const correct = isCorrect === true;
                    
                    return (
                      <View 
                        key={index} 
                        style={[
                          styles.letterCircle,
                          isFilled && styles.letterCircleFilled,
                          isActive && styles.letterCircleActive,
                          correct && styles.letterCircleCorrect,
                        ]}
                      >
                        <Text style={styles.letterChar}>{char.toUpperCase()}</Text>
                      </View>
                    );
                  })}
                </View>
              </TouchableOpacity>
              
              <TextInput
                ref={inputRef}
                style={styles.hiddenTextInput}
                value={userInput}
                onChangeText={handleTextChange}
                autoFocus={currentIndex === 0 || isCorrect !== null}
                maxLength={currentExercise.answer.length}
                autoCapitalize="none"
                editable={isCorrect === null}
              />
            </View>
          )}

          {isCorrect !== null && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>Giải thích câu này:</Text>
              <Text style={styles.explanationText}>{currentExercise.explanation}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {isCorrect !== null && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex === exercises.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* For fill_blank, we might need a text input, but for simplicity in MVP let's make them Multiple Choice or just show result */}
      {currentExercise.type === 'fill_blank' && isCorrect === null && (
        <View style={styles.footer}>
           <TouchableOpacity 
            style={styles.showAnswerButton} 
            onPress={() => setIsCorrect(false)}
           >
             <Text style={styles.showAnswerText}>Bỏ qua / Xem đáp án</Text>
           </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    gap: 15,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    width: 35,
  },
  scoreBadge: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  scoreBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#A16207',
  },
  scrollContent: {
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 30,
    marginBottom: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  optionText: {
    fontSize: 16,
    color: '#475569',
    flex: 1,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  explanationBox: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  answerBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    alignItems: 'center',
  },
  answerBoxLabel: {
    fontSize: 12,
    color: '#15803D',
    marginBottom: 4,
  },
  answerBoxValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  nextButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Fill-in-the-blank styles
  fillBlankContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputArea: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  lettersWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  letterCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    borderColor: '#0EA5E9',
    borderWidth: 3,
  },
  letterCircleCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  letterChar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  hiddenTextInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  showAnswerButton: {
    height: 56,
    backgroundColor: '#F1F5F9',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showAnswerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
  },
  finishedWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  finishedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
  },
  finishedScore: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 40,
  },
  backButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
