import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { grammarApi, GrammarSubmitAnswer } from '../api/grammarApi';
import { GrammarPracticeQuizResponse } from '../types/grammar';

const { width } = Dimensions.get('window');

type QuizValue = number | string;

export const QuizSolvingScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [quiz, setQuiz] = useState<GrammarPracticeQuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, QuizValue>>({});
  const [showGridModal, setShowGridModal] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [quizRes, submissionRes] = await Promise.allSettled([
          grammarApi.getPracticeQuiz(taskId),
          grammarApi.getPracticeSubmission(taskId),
        ]);

        if (quizRes.status === 'fulfilled') {
          setQuiz(quizRes.value.data);
        }

        if (submissionRes.status === 'fulfilled') {
          const savedAnswers: Record<number, QuizValue> = {};
          submissionRes.value.data.answers.forEach((answer) => {
            if (answer.optionId != null) {
              savedAnswers[answer.quizId] = answer.optionId;
            } else if (answer.textAnswer != null) {
              savedAnswers[answer.quizId] = answer.textAnswer;
            }
          });
          setAnswers(savedAnswers);
        }
      } finally {
        setLoading(false);
      }
    };

    if (taskId) load();
  }, [taskId]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const totalQuestions = quiz?.totalQuestions || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const currentAnswer = currentQuestion ? answers[currentQuestion.quizId] : undefined;

  const handleSelectOption = (optionId: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.quizId]: optionId }));
  };

  const handleTextChange = (text: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.quizId]: text }));
  };

  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowGridModal(false);
  };

  const submitAnswers = async () => {
    if (!quiz || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: GrammarSubmitAnswer[] = quiz.questions.map((question) => {
        const answer = answers[question.quizId];
        if (question.type === 'MULTIPLE_CHOICE') {
          return {
            quizId: question.quizId,
            optionId: typeof answer === 'number' ? answer : null,
          };
        }

        return {
          quizId: question.quizId,
          textAnswer: typeof answer === 'string' ? answer : null,
        };
      });

      await grammarApi.submitPractice(taskId, payload, true);
      navigation.navigate('QuizResult', { answers: { practiceId: taskId } });
    } catch (error: any) {
      const message = String(error?.message || '');
      if (message.includes('404') || message.toLowerCase().includes('user not found')) {
        setSubmitError('Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại rồi thử nộp bài.');
      } else {
        setSubmitError(error?.message || 'Không thể nộp bài. Vui lòng thử lại.');
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }
    submitAnswers();
  };

  const canContinue = useMemo(() => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.quizId];
    return currentQuestion.type === 'MULTIPLE_CHOICE' ? typeof answer === 'number' : typeof answer === 'string' && answer.trim().length > 0;
  }, [answers, currentQuestion]);

  if (loading || !quiz) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#E67E22" />
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={{ color: '#64748B' }}>Không tìm thấy câu hỏi.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{quiz.title}</Text>
          <TouchableOpacity style={styles.gridButton} onPress={() => setShowGridModal(true)}>
            <MaterialCommunityIcons name="view-grid" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Tiến độ</Text>
            <Text style={styles.progressCount}>Câu {currentQuestionIndex + 1}/{totalQuestions}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressInner, { width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.questionContent}>
          <Text style={styles.instructionText}>
            {currentQuestion.type === 'MULTIPLE_CHOICE' ? 'Chọn đáp án đúng' : 'Điền từ vào ô trống'}
          </Text>

          <View style={styles.questionBox}>
            <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
          </View>

          {currentQuestion.type === 'MULTIPLE_CHOICE' ? (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, idx) => {
                const selected = currentAnswer === option.optionId;
                return (
                  <TouchableOpacity
                    key={option.optionId}
                    style={[styles.optionItem, selected && styles.optionSelected]}
                    onPress={() => handleSelectOption(option.optionId)}
                  >
                    <View style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                      <Text style={[styles.optionLabelText, selected && styles.optionLabelTextSelected]}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {option.optionText}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập câu trả lời..."
                placeholderTextColor="#94A3B8"
                value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                onChangeText={handleTextChange}
                autoFocus
                maxLength={255}
                autoCapitalize="none"
              />
            </View>
          )}

          {currentQuestion.explanation ? (
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>Gợi ý</Text>
              <Text style={styles.hintText}>{currentQuestion.explanation}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, (!canContinue || submitting) && styles.nextBtnDisabled]}
            disabled={!canContinue || submitting}
            onPress={handleNext}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.nextBtnText}>{currentQuestionIndex === totalQuestions - 1 ? 'Nộp bài' : 'Câu tiếp'}</Text>
            )}
          </TouchableOpacity>
          {submitError ? <Text style={styles.submitErrorText}>{submitError}</Text> : null}
        </View>

        <Modal visible={showGridModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Danh sách câu hỏi</Text>
                <TouchableOpacity onPress={() => setShowGridModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <View style={styles.gridContainer}>
                {quiz.questions.map((question, idx) => {
                  const isDone = answers[question.quizId] !== undefined && answers[question.quizId] !== '';
                  const isCurrent = currentQuestionIndex === idx;
                  return (
                    <TouchableOpacity
                      key={question.quizId}
                      style={[
                        styles.gridItem,
                        isDone && styles.gridItemDone,
                        isCurrent && styles.gridItemCurrent,
                      ]}
                      onPress={() => jumpToQuestion(idx)}
                    >
                      <Text style={[
                        styles.gridItemText,
                        isDone && styles.gridItemTextDone,
                        isCurrent && styles.gridItemTextCurrent,
                      ]}>
                        {idx + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.submitEarlyBtn, submitting && styles.submitEarlyBtnDisabled]}
                disabled={submitting}
                onPress={() => {
                  setShowGridModal(false);
                  submitAnswers();
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#E11D48" />
                ) : (
                  <Text style={styles.submitEarlyBtnText}>Nộp bài sớm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', flex: 1, textAlign: 'center', marginHorizontal: 12 },
  gridButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  progressSection: { paddingHorizontal: 20, marginVertical: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: '#94A3B8' },
  progressCount: { fontSize: 14, fontWeight: 'bold', color: '#E67E22' },
  progressBar: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressInner: { height: '100%', backgroundColor: '#E67E22' },
  questionContent: { padding: 20, paddingBottom: 32 },
  instructionText: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 20 },
  questionBox: { backgroundColor: '#FFF', borderRadius: 20, padding: 30, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  questionText: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', lineHeight: 30 },
  optionsContainer: { gap: 16 },
  optionItem: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  optionSelected: { borderColor: '#E67E22', backgroundColor: '#FFF7ED' },
  optionLabel: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  optionLabelSelected: { backgroundColor: '#FFF', borderColor: '#E67E22' },
  optionLabelText: { fontSize: 16, fontWeight: 'bold', color: '#64748B' },
  optionLabelTextSelected: { color: '#E67E22' },
  optionText: { fontSize: 16, color: '#0F172A', flex: 1 },
  optionTextSelected: { fontWeight: 'bold', color: '#E67E22' },
  inputContainer: { marginTop: 10 },
  textInput: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, fontSize: 18, borderWidth: 1, borderColor: '#F1F5F9', color: '#0F172A' },
  hintBox: { marginTop: 20, backgroundColor: '#FFF7ED', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FED7AA' },
  hintTitle: { fontSize: 14, fontWeight: 'bold', color: '#C2410C', marginBottom: 6 },
  hintText: { fontSize: 14, color: '#9A3412', lineHeight: 20 },
  footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 0 : 20 },
  nextBtn: { backgroundColor: '#E67E22', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#E67E22', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  nextBtnDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },
  nextBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  submitErrorText: { marginTop: 12, color: '#DC2626', fontSize: 13, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
  gridItem: { width: (width - 48 - 36) / 4, height: (width - 48 - 36) / 4, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  gridItemDone: { backgroundColor: '#E67E22' },
  gridItemCurrent: { borderColor: '#E67E22', backgroundColor: '#FFF' },
  gridItemText: { fontSize: 16, fontWeight: 'bold', color: '#64748B' },
  gridItemTextDone: { color: '#FFF' },
  gridItemTextCurrent: { color: '#E67E22' },
  submitEarlyBtn: { backgroundColor: '#FFF1F2', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  submitEarlyBtnDisabled: { opacity: 0.7 },
  submitEarlyBtnText: { color: '#E11D48', fontSize: 16, fontWeight: 'bold' },
});
