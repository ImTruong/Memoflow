import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { grammarApi } from '../api/grammarApi';
import { GrammarPracticeResultResponse } from '../types/grammar';
import { AiAssistantScreen } from './AiAssistantScreen';

export const QuizResultScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const practiceId = route.params?.practiceId ?? route.params?.answers?.practiceId;
  const [result, setResult] = useState<GrammarPracticeResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedExplanation, setExpandedExplanation] = useState<number | null>(null);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiHiddenContext, setAiHiddenContext] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await grammarApi.getPracticeResult(practiceId);
        setResult(res.data);
      } finally {
        setLoading(false);
      }
    };

    if (practiceId) load();
  }, [practiceId]);

  if (loading || !result) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['left', 'right', 'bottom']}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  const handleAiExplain = (question: GrammarPracticeResultResponse['questions'][number]) => {
    const isMultipleChoice = question.type === 'MULTIPLE_CHOICE';
    const userAnswer = isMultipleChoice
      ? question.options.find((option) => option.optionId === question.userOptionId)?.optionText || 'Chưa trả lời'
      : question.userTextAnswer || 'Chưa trả lời';

    const prompt = `Giải thích giúp mình câu này: "${question.questionText}"`;
    const hiddenContext = `Học viên vừa làm một câu hỏi ngữ pháp.
  Thông tin nội bộ (không hiển thị nguyên văn cho học viên):
  - Câu hỏi: "${question.questionText}"
  - Đáp án của học viên: "${userAnswer}"
  - Đáp án đúng: "${question.correctTextAnswer}"
  - Lời giải thích ngắn: "${question.explanation || 'Không có'}"
  Yêu cầu phản hồi:
  - Trả lời bằng tiếng Việt.
  - Giải thích vì sao đáp án của học viên đúng/sai.
  - Phải giải thích tất cả các đáp án.
  - Đáp án nào sai thì giải thích tại sao sai. Đáp án nào đúng thì giải thích tại sao đúng.
  - Nêu rõ cấu trúc ngữ pháp áp dụng.
  - Cho thêm 2 ví dụ tương tự.`;

    setAiPrompt(prompt);
    setAiHiddenContext(hiddenContext);
    setIsAiModalVisible(true);
  };

  const renderResultItem = (question: GrammarPracticeResultResponse['questions'][number], index: number) => {
    const isMultipleChoice = question.type === 'MULTIPLE_CHOICE';

    return (
      <View key={question.quizId} style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <MaterialCommunityIcons
            name={question.correct ? 'check-circle-outline' : 'close-circle-outline'}
            size={24}
            color={question.correct ? '#10B981' : '#EF4444'}
          />
          <Text style={styles.questionNumText}>{index + 1}. {question.questionText}</Text>
          <TouchableOpacity onPress={() => handleAiExplain(question)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="robot-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <View style={styles.answerDetails}>
          <Text style={styles.userAnswerText}>
            Câu trả lời của bạn: <Text style={question.correct ? styles.correctText : styles.wrongText}>
              {isMultipleChoice
                ? question.options.find((option) => option.optionId === question.userOptionId)?.optionText || 'Chưa trả lời'
                : question.userTextAnswer || 'Chưa trả lời'}
            </Text>
          </Text>
          {!question.correct && (
            <Text style={styles.correctAnswerInfo}>
              Đáp án đúng: <Text style={styles.correctTextHighlight}>{isMultipleChoice ? question.correctTextAnswer : question.correctTextAnswer}</Text>
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.explanationBtn}
          onPress={() => setExpandedExplanation(expandedExplanation === question.quizId ? null : question.quizId)}
        >
          <Text style={styles.explanationBtnText}>
            {expandedExplanation === question.quizId ? 'Ẩn giải thích' : 'Xem giải thích'}
          </Text>
          <MaterialCommunityIcons
            name={expandedExplanation === question.quizId ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#3B82F6"
          />
        </TouchableOpacity>

        {expandedExplanation === question.quizId && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>Giải thích:</Text>
            <Text style={styles.explanationText}>{question.explanation || 'Chưa có giải thích.'}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kết quả ôn tập</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{result.score}</Text>
            <View style={styles.scoreDivider} />
            <Text style={styles.totalText}>{result.totalQuestions}</Text>
          </View>
          <Text style={styles.resultStatus}>Chính xác</Text>
          <Text style={styles.motivationalText}>Bạn đã làm rất tốt!</Text>
        </View>

        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>Chi tiết đáp án</Text>
        </View>

        {result.questions.map((question, index) => renderResultItem(question, index))}

        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.navigate('QuizSolving', { taskId: practiceId })}>
            <Text style={styles.retryBtnText}>Làm lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('PracticeDetail', { taskId: practiceId })}>
            <Text style={styles.continueBtnText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  modalSafeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  scrollContent: { paddingBottom: 40 },
  scoreSection: { alignItems: 'center', backgroundColor: '#FFF', paddingVertical: 40, marginBottom: 12 },
  scoreCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  scoreText: { fontSize: 48, fontWeight: 'bold', color: '#1E40AF' },
  scoreDivider: { width: 40, height: 2, backgroundColor: '#E2E8F0', marginVertical: 4 },
  totalText: { fontSize: 20, color: '#64748B', fontWeight: 'bold' },
  resultStatus: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  motivationalText: { fontSize: 16, color: '#64748B', marginTop: 8 },
  detailsHeader: { padding: 20 },
  detailsTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  resultCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  resultHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  questionNumText: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginLeft: 12, lineHeight: 24 },
  answerDetails: { marginTop: 12, paddingLeft: 36 },
  userAnswerText: { fontSize: 15, color: '#64748B' },
  correctText: { color: '#10B981', fontWeight: 'bold' },
  wrongText: { color: '#EF4444', fontWeight: 'bold', textDecorationLine: 'line-through' },
  correctAnswerInfo: { fontSize: 15, color: '#10B981', marginTop: 4, fontWeight: '500' },
  correctTextHighlight: { fontWeight: 'bold' },
  explanationBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingLeft: 36 },
  explanationBtnText: { fontSize: 14, color: '#3B82F6', fontWeight: 'bold', marginRight: 4 },
  explanationBox: { marginTop: 12, backgroundColor: '#FFF1F2', borderRadius: 12, padding: 16, marginLeft: 36 },
  explanationTitle: { fontSize: 14, fontWeight: 'bold', color: '#BE123C', marginBottom: 4 },
  explanationText: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  footerActions: { flexDirection: 'row', padding: 20, gap: 16, marginTop: 24 },
  retryBtn: { flex: 1, height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  retryBtnText: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  continueBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  continueBtnText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
});
