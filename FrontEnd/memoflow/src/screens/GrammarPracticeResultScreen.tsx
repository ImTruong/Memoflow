import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { grammarApi } from '../api/grammarApi';
import { GrammarPracticeResultResponse } from '../types/grammar';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AiAssistantScreen } from './AiAssistantScreen';

type Props = {
  onBack: () => void;
  practiceId: number;
};

export const GrammarPracticeResultScreen: React.FC<Props> = ({ onBack, practiceId }) => {
  const [result, setResult] = useState<GrammarPracticeResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedExplanation, setExpandedExplanation] = useState<Record<number, boolean>>({});
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiHiddenContext, setAiHiddenContext] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await grammarApi.getPracticeResult(practiceId);
        setResult(res.data);
      } catch (err) {
        console.error('Error fetching grammar result', err);
        Alert.alert('Lỗi', 'Không thể tải kết quả bài làm.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [practiceId]);

  const toggleExpand = (quizId: number) => {
    setExpandedExplanation(prev => ({ ...prev, [quizId]: !prev[quizId] }));
  };

  const handleAiExplain = (question: GrammarPracticeResultResponse['questions'][number]) => {
    const isMultipleChoice = question.type === 'MULTIPLE_CHOICE';
    const userAnswer = isMultipleChoice
      ? question.options.find((option) => option.optionId === question.userOptionId)?.optionText || 'Chưa trả lời'
      : question.userTextAnswer || 'Chưa trả lời';

    const optionsText = isMultipleChoice 
      ? question.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o.optionText}`).join('\n')
      : '';

    const prompt = `Giải thích giúp mình câu này.
Câu hỏi: "${question.questionText}"
${isMultipleChoice ? `Các lựa chọn:\n${optionsText}` : ''}
Đáp án của mình: ${userAnswer}
Đáp án đúng: ${question.correctTextAnswer}

Hãy phân tích kỹ lý do tại sao đáp án đúng là chính xác nhất.`;

    const hiddenContext = `Học viên vừa làm một câu hỏi ngữ pháp.
Thông tin nội bộ:
- Câu hỏi: "${question.questionText}"
- Loại câu hỏi: "${question.type}"
- Đáp án của học viên: "${userAnswer}"
- Đáp án đúng: "${question.correctTextAnswer}"
- Lời giải thích: "${question.explanation || 'Không có'}"
Yêu cầu phản hồi:
- Trả lời bằng tiếng Việt chuyên sâu.
- Phải giải thích tất cả các đáp án (nếu là trắc nghiệm).
- Đáp án nào sai thì giải thích tại sao sai. Đáp án nào đúng thì giải thích tại sao đúng.
- Nêu rõ cấu trúc ngữ pháp áp dụng.`;

    setAiPrompt(prompt);
    setAiHiddenContext(hiddenContext);
    setIsAiModalVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (!result) return null;

  return (
    <View style={styles.container}>
      <ScreenHeader title={result.title} onBack={onBack} titleStyle={styles.headerTitle} />

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        <View style={styles.summaryCard}>
          <View style={styles.scoreCircle}>
            <Progress.Circle
              size={120}
              progress={result.score / result.totalQuestions}
              showsText={true}
              formatText={() => (
                <View style={styles.scoreTextGroup}>
                  <Text style={styles.scoreBigText}>{result.score}/{result.totalQuestions}</Text>
                  <Text style={styles.scoreSubText}>Chính xác</Text>
                </View>
              )}
              color="#10B981"
              unfilledColor="#F3F4F6"
              borderWidth={0}
              thickness={10}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Chi tiết bài làm</Text>

        {result.questions.map((question, index) => {
          // DEBUG: Log question data
          console.log(`Q${index + 1}:`, {
            questionText: question.questionText,
            correct: question.correct,
            userOptionId: question.userOptionId,
            options: question.options?.map(o => ({ optionId: o.optionId, text: o.optionText, isCorrect: o.isCorrect }))
          });
          
          return (
          <View key={question.quizId} style={styles.quizCard}>
            <View style={styles.quizHeader}>
              <View style={styles.questionTitleRow}>
                <Text style={styles.questionIndex}>{index + 1}.</Text>
                <Text style={styles.questionText}>{question.questionText}</Text>
              </View>
              <View style={styles.quizActions}>
                {question.correct ? (
                  <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.statusText, { color: '#10B981' }]}>ĐÚNG</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: '#FEF2F2' }]}>
                    <Text style={[styles.statusText, { color: '#EF4444' }]}>SAI</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => handleAiExplain(question)} style={styles.aiBtn}>
                  <MaterialCommunityIcons name="robot-outline" size={22} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>

            {question.type === 'MULTIPLE_CHOICE' ? (
              <View style={styles.optionsContainer}>
                 {question.options.map((opt, oIdx) => {
                  const label = String.fromCharCode(65 + oIdx);
                  const isUserSelected = question.userOptionId === opt.optionId;
                  const isCorrect = opt.isCorrect;

                  const shouldShowGreen = isCorrect;
                  const shouldShowRed = isUserSelected && !isCorrect;

                  return (
                    <View
                      key={opt.optionId}
                      style={[
                        styles.optionItem,
                        shouldShowGreen && styles.optionCorrect,
                        shouldShowRed && styles.optionWrong
                      ]}
                    >
                      <View
                        style={[
                          styles.optionCircle,
                          shouldShowGreen
                            ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                            : shouldShowRed
                            ? { backgroundColor: '#EF4444', borderColor: '#EF4444' }
                            : {}
                        ]}
                      >
                        <Text style={[
                          styles.optionLabel,
                          (shouldShowGreen || shouldShowRed)
                            ? { color: '#FFF' }
                            : {}
                        ]}>
                          {label}
                        </Text>
                      </View>
                      <Text style={[
                        styles.optionText,
                        (shouldShowGreen || shouldShowRed)
                          ? { fontWeight: 'bold' }
                          : {}
                      ]}>
                        {opt.optionText}
                      </Text>
                      {shouldShowGreen && <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginLeft: 'auto' }} />}
                      {shouldShowRed && <Ionicons name="close-circle" size={18} color="#EF4444" style={{ marginLeft: 'auto' }} />}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.textAnswerZone}>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Của bạn:</Text>
                  <Text style={[styles.answerValue, question.correct ? { color: '#10B981' } : { color: '#EF4444' }]}>
                    {question.userTextAnswer || 'Chưa trả lời'}
                  </Text>
                </View>
                {!question.correct && (
                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Đáp án:</Text>
                    <Text style={[styles.answerValue, { color: '#10B981', fontWeight: 'bold' }]}>
                      {question.correctTextAnswer}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity 
              style={styles.explanationHeader} 
              onPress={() => toggleExpand(question.quizId.valueOf() as number)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={expandedExplanation[question.quizId.valueOf() as number] ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#64748B" 
              />
              <Text style={styles.explanationHeaderText}>
                {expandedExplanation[question.quizId.valueOf() as number] ? "Ẩn giải thích" : "Xem giải thích"}
              </Text>
            </TouchableOpacity>

            {expandedExplanation[question.quizId.valueOf() as number] && (
              <View style={styles.explanationContent}>
                <Text style={styles.explanationText}>
                  {question.explanation || "Chưa có giải thích chi tiết cho câu này."}
                </Text>
              </View>
            )}
          </View>
          );
        })}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={isAiModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={() => setIsAiModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom']}>
          <AiAssistantScreen
            onBack={() => setIsAiModalVisible(false)}
            route={{
              params: {
                autoSend: true,
                autoSendMessage: aiPrompt,
                hiddenContext: aiHiddenContext,
              },
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD' },
  modalSafeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937' },
  scrollBody: { padding: 16 },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  scoreCircle: { alignItems: 'center', justifyContent: 'center' },
  scoreTextGroup: { alignItems: 'center' },
  scoreBigText: { fontSize: 32, fontWeight: '900', color: '#1E293B' },
  scoreSubText: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold', marginTop: -2 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 16, marginLeft: 4 },
  quizCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  questionTitleRow: { flex: 1, flexDirection: 'row' },
  questionIndex: { fontSize: 16, fontWeight: '900', color: '#1E293B', marginRight: 6 },
  questionText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', lineHeight: 24, flex: 1 },
  quizActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
  aiBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  optionsContainer: { gap: 12, marginBottom: 16 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  optionCorrect: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  optionWrong: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  optionCorrectHint: { borderColor: '#10B981', borderStyle: 'dashed' },
  optionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FFF',
  },
  optionLabel: { fontSize: 13, fontWeight: 'bold', color: '#64748B' },
  optionText: { fontSize: 14, color: '#475569', flex: 1 },
  textAnswerZone: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, gap: 10, marginBottom: 16 },
  answerRow: { flexDirection: 'row', alignItems: 'center' },
  answerLabel: { fontSize: 13, color: '#94A3B8', width: 70, fontWeight: 'bold' },
  answerValue: { fontSize: 15, fontWeight: 'bold', flex: 1 },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  explanationHeaderText: { fontSize: 13, color: '#64748B', fontWeight: 'bold', marginLeft: 6 },
  explanationContent: { marginTop: 12, backgroundColor: '#FFF7ED', padding: 16, borderRadius: 16 },
  explanationText: { fontSize: 14, color: '#92400E', lineHeight: 22 },
});
