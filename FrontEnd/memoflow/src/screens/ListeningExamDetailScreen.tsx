import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

type ListeningExamDetailScreenProps = {
  onBack: () => void;
  examId: string;
};

// Mock data structured for translation review
const detailedResults = [
  {
    id: 'q1',
    type: 'single',
    title: 'Question 1',
    status: 'correct',
    userAnswer: 'A',
    correctAnswer: 'A',
    audioTime: '0:15',
    text: "Who's working at the front desk today?",
    options: ["(A) That's a difficult request.", "(B) It's Katie Miller.", "(C) Make room on your desk."],
    transcript: "Who's working at the front desk today?\n(A) That's a difficult request.\n(B) It's Katie Miller.\n(C) Make room on your desk.",
    transcriptTranslation: "Hôm nay ai làm việc ở quầy lễ tân?\n(A) Đó là một yêu cầu khó khăn.\n(B) Đó là Katie Miller.\n(C) Hãy dọn chỗ trên bàn làm việc của bạn.",
    fullTranslation: "Hôm nay ai làm việc ở quầy lễ tân?\n(A) Đó là một yêu cầu khó khăn.\n(B) Đó là Katie Miller.\n(C) Hãy dọn chỗ trên bàn làm việc của bạn.",
  },
  {
    id: 'g1',
    type: 'group',
    title: 'Question 2-4',
    audioTime: '1:30',
    transcript: "M: Hello, I'm Steven from Home Appliance Mart. Q2 I'm here to install the UHD television that you ordered last week.\nW: Yes, come right this way. We would like to mount the television on this wall. We plan to use it for presentations and training seminars.\nM: Oh, no. Q3 It looks like I forgot the tools that I need to screw the television to the wall mount. I'm sorry. I'll have to come back tomorrow morning.\nW: Oh, that's all right. Q4 However, please call me before you come tomorrow to make sure that someone is in the office to meet you.",
    transcriptTranslation: "M: Xin chào, tôi là Steven từ trung tâm điện máy Home Appliance Mart. Q1 Tôi đến để lắp đặt chiếc tivi UHD mà bạn đã đặt hàng tuần trước.\nW: Vâng, xin mời đi lối này. Chúng tôi muốn gắn tivi lên bức tường này. Chúng tôi dự định sử dụng nó cho các bài thuyết trình và hội thảo đào tạo.\nM: Ôi không. Q2 Có vẻ như tôi đã quên vài dụng cụ cần thiết để vặn chốt gắn tivi lên giá treo tường.Tôi xin lỗi. Tôi sẽ quay lại vào sáng mai.\nW: Ố, không sao đâu. Q3 Vui lòng gọi cho tôi trước khi bạn đến vào ngày mai để đảm bảo rằng có người ở văn phòng đón bạn.",
    questions: [
      {
        id: 'q2',
        title: 'Question 2',
        status: 'correct',
        userAnswer: 'A',
        correctAnswer: 'A',
        text: "What is the man's purpose for the visit?",
        options: ["To install a television", "To repair a wall", "To deliver a seminar", "To pick up some tools"],
        fullTranslation: "Mục đích chuyến thăm của người đàn ông là gì?\n(A) Để lắp đặt tivi\n(B) Để sửa tường\n(C) Để tổ chức hội thảo\n(D) Để lấy dụng cụ",
      },
      {
        id: 'q3',
        title: 'Question 3',
        status: 'wrong',
        userAnswer: 'C',
        correctAnswer: 'B',
        text: "Why must the man return tomorrow?",
        options: ["The office is closed", "He lacks the necessary tools", "The television is damaged", "He has another appointment"],
        fullTranslation: "Tại sao người đàn ông phải quay lại vào ngày mai?\n(A) Văn phòng đóng cửa\n(B) Anh ấy thiếu dụng cụ cần thiết\n(C) Tivi bị hỏng\n(D) Anh ấy có hẹn khác",
      },
      {
        id: 'q4',
        title: 'Question 4',
        status: 'correct',
        userAnswer: 'D',
        correctAnswer: 'D',
        text: "What does the woman ask the man to do?",
        options: ["Pay for the installation", "Return the equipment", "Move the wall mount", "Call before arriving"],
        fullTranslation: "Người phụ nữ yêu cầu người đàn ông làm gì?\n(A) Trả tiền lắp đặt\n(B) Trả lại thiết bị\n(C) Di chuyển giá treo tường\n(D) Gọi điện trước khi đến",
      }
    ]
  }
];

export const ListeningExamDetailScreen: React.FC<ListeningExamDetailScreenProps> = ({ 
  onBack, 
  examId 
}) => {
  const [expandedTranscripts, setExpandedTranscripts] = useState<Record<string, boolean>>({});

  const toggleTranscript = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTranscripts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const AudioPlayer = ({ time, title }: { time: string, title?: string }) => (
    <View style={styles.audioPlayerCard}>
      <TouchableOpacity style={styles.playBtnLarge}>
        <Ionicons name="play" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.audioInfoContainer}>
        <View style={styles.audioTimeline}>
          <Text style={styles.audioTimeLabel}>0:10</Text>
          <View style={styles.audioTrack}>
            <View style={[styles.audioFill, { width: '40%' }]} />
          </View>
          <Text style={styles.audioTimeLabel}>{time}</Text>
        </View>
        {title && <Text style={styles.audioTitleText} numberOfLines={1}>{title}</Text>}
      </View>
    </View>
  );

  const TranscriptionBox = ({ transcript, translation, isExpanded, onToggle }: any) => (
    <View style={styles.transcriptionWrapper}>
      <TouchableOpacity onPress={onToggle} style={styles.toggleHeader}>
        <View style={styles.toggleTitleRow}>
          <MaterialCommunityIcons name="script-text-outline" size={18} color={colors.primary} />
          <Text style={styles.toggleTitleText}>Show Transcript & Translation</Text>
        </View>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.primary} />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.textSection}>
            <Text style={styles.sectionLabel}>ORIGINAL TRANSCRIPT</Text>
            <Text style={styles.originalText}>{transcript}</Text>
          </View>
          <View style={styles.textSection}>
            <Text style={[styles.sectionLabel, { color: '#3B82F6' }]}>BẢN DỊCH ĐOẠN HỘI THOẠI</Text>
            <View style={styles.translationCard}>
              <Text style={styles.translationContent}>{translation}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderOptions = (options: string[], userAnswer: string, correctAnswer: string) => {
    return (
      <View style={styles.optionsList}>
        {options.map((opt, index) => {
          const label = String.fromCharCode(65 + index);
          const isCorrectStr = label === correctAnswer;
          const isUserChoice = label === userAnswer;
          
          return (
            <View 
              key={index} 
              style={[
                styles.optionItem,
                isCorrectStr && styles.optionCorrect,
                isUserChoice && !isCorrectStr && styles.optionWrong
              ]}
            >
              <View style={[
                styles.optionCircle,
                isCorrectStr && styles.optionCircleCorrect,
                isUserChoice && !isCorrectStr && styles.optionCircleWrong
              ]}>
                {isCorrectStr ? (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                ) : isUserChoice ? (
                  <Ionicons name="close" size={12} color="#FFFFFF" />
                ) : (
                  <Text style={styles.optionLabelText}>{label}</Text>
                )}
              </View>
              <Text style={[
                styles.optionText,
                isCorrectStr && styles.optionTextCorrect,
                isUserChoice && !isCorrectStr && styles.optionTextWrong
              ]}>{opt}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const FullTranslationBlock = ({ content }: { content: string }) => (
    <View style={styles.fullTranslationBox}>
      <View style={styles.translationHeaderRow}>
        <Ionicons name="language" size={14} color="#3B82F6" />
        <Text style={styles.translationHeaderLabel}>BẢN DỊCH CHI TIẾT</Text>
      </View>
      <Text style={styles.fullTranslationText}>{content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blobBlue, { top: -100, right: -100 }]} />
      <View style={[styles.blob, styles.blobGreen, { bottom: -50, left: -50 }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{examId}</Text>
          <Text style={styles.headerSubtitle}>Exam Results Review</Text>
        </View>
        <View style={styles.topScoreBadge}>
          <Text style={styles.topScoreText}>8/10</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainStatsCard}>
          <View style={styles.accuracyRingContainer}>
            <View style={styles.accuracyRingBase}>
              <View style={styles.accuracyRingInner}>
                <Text style={styles.accuracyValue}>80<Text style={styles.accuracyUnit}>%</Text></Text>
                <Text style={styles.accuracyLabel}>Chính xác</Text>
              </View>
              <View style={[styles.accuracyProgress, { borderTopColor: colors.primary, transform: [{ rotate: '45deg' }] }]} />
            </View>
          </View>
          
          <View style={styles.verticalStats}>
            <View style={styles.miniStatRow}>
              <View style={styles.miniStatBox}>
                <Text style={styles.miniStatLabel}>THỜI GIAN</Text>
                <Text style={styles.miniStatValue}>12:45</Text>
              </View>
              <View style={styles.statLineDivider} />
              <View style={styles.miniStatBox}>
                <Text style={styles.miniStatLabel}>ĐIỂM SỐ</Text>
                <Text style={styles.miniStatValue}>850</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleText}>Analysis Report</Text>
          <View style={styles.filterTag}>
            <Text style={styles.filterTagText}>Tất cả câu hỏi</Text>
            <Ionicons name="chevron-down" size={12} color="#64748B" />
          </View>
        </View>

        {detailedResults.map((item) => {
          if (item.type === 'single') {
            return (
              <View key={item.id} style={styles.fullWidthCard}>
                <View style={styles.qHeaderRow}>
                  <View style={[styles.qNumBadge, { backgroundColor: item.status === 'correct' ? '#F0FDF4' : '#FEF2F2' }]}>
                    <Text style={[styles.qNumText, { color: item.status === 'correct' ? '#22C55E' : '#EF4444' }]}>#1</Text>
                  </View>
                  <Text style={styles.qStatusMainText}>Question 1 • {item.status === 'correct' ? 'Đúng' : 'Sai'}</Text>
                </View>

                <Text style={styles.questionTextMain}>{item.text}</Text>
                
                <AudioPlayer time={item.audioTime!} />
                {renderOptions(item.options!, item.userAnswer!, item.correctAnswer!)}
                
                {/* Translation moved to the end of the card */}
                {item.fullTranslation && <FullTranslationBlock content={item.fullTranslation} />}
              </View>
            );
          } else {
            return (
              <View key={item.id} style={styles.groupContainer}>
                <View style={styles.groupMasterHeader}>
                  <View style={styles.groupTitleRow}>
                    <MaterialCommunityIcons name="headphones" size={20} color={colors.primary} />
                    <Text style={styles.groupTitleLabel}>{item.title}</Text>
                  </View>
                  <AudioPlayer time={item.audioTime!} title="Shared Audio Segment" />
                  <TranscriptionBox 
                    transcript={item.transcript} 
                    translation={item.transcriptTranslation}
                    isExpanded={expandedTranscripts[item.id]}
                    onToggle={() => toggleTranscript(item.id)}
                  />
                </View>

                {item.questions?.map((subQ, idx) => (
                  <View key={subQ.id} style={styles.subQuestionFullWidth}>
                    <View style={styles.subQHeaderRow}>
                       <View style={[styles.subQIdxBox, { backgroundColor: subQ.status === 'correct' ? '#F0FDF4' : '#FEF2F2' }]}>
                         <Text style={[styles.subQIdxText, { color: subQ.status === 'correct' ? '#22C55E' : '#EF4444' }]}>#{idx + 2}</Text>
                       </View>
                       <View style={{flex: 1}}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Text style={styles.subQQuestionText}>{subQ.title} • {subQ.status === 'correct' ? 'Đúng' : 'Sai'}</Text>
                         </View>
                         <Text style={[styles.subQQuestionText, { color: '#1E293B', fontWeight: 'bold' }]}>{subQ.text}</Text>
                       </View>
                    </View>
                    
                    {renderOptions(subQ.options!, subQ.userAnswer, subQ.correctAnswer)}

                    {/* Sub-question translation moved to AFTER options */}
                    {subQ.fullTranslation && <FullTranslationBlock content={subQ.fullTranslation} />}
                  </View>
                ))}
              </View>
            );
          }
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  blob: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.05,
  },
  blobBlue: {
    backgroundColor: '#3B82F6',
  },
  blobGreen: {
    backgroundColor: '#10B981',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topScoreBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  topScoreText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  mainStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  accuracyRingContainer: {
    marginRight: 24,
  },
  accuracyRingBase: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  accuracyRingInner: {
    alignItems: 'center',
  },
  accuracyValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
  },
  accuracyUnit: {
    fontSize: 12,
    color: '#94A3B8',
  },
  accuracyLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  accuracyProgress: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    top: -8,
    left: -8,
  },
  verticalStats: {
    flex: 1,
  },
  miniStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  miniStatBox: {
    alignItems: 'center',
  },
  miniStatLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '900',
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  statLineDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  filterTagText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  fullWidthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  qHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  qNumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  qNumText: {
    fontSize: 13,
    fontWeight: '900',
  },
  qStatusMainText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
  },
  questionTextMain: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 16,
  },
  audioPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FD',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  playBtnLarge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  audioInfoContainer: {
    flex: 1,
  },
  audioTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  audioTimeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  audioTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  audioFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  audioTitleText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '800',
  },
  optionsList: {
    gap: 10,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FD',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  optionWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  optionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionCircleCorrect: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  optionCircleWrong: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  optionLabelText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
  },
  optionText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  optionTextCorrect: {
    color: '#166534',
    fontWeight: '800',
  },
  optionTextWrong: {
    color: '#991B1B',
    fontWeight: '800',
  },
  fullTranslationBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginBottom: 20,
  },
  translationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  translationHeaderLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
  fullTranslationText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    fontWeight: '600',
  },
  transcriptionWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleTitleText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
  },
  expandedContent: {
    marginTop: 16,
    gap: 16,
  },
  textSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  originalText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
    fontWeight: '600',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  translationCard: {
    backgroundColor: '#EEF2FF',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#818CF8',
  },
  translationContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  groupContainer: {
    marginBottom: 30,
  },
  groupMasterHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    elevation: 2,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  groupTitleLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  subQuestionFullWidth: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    width: '100%',
  },
  subQHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  subQIdxBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subQIdxText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#475569',
  },
  subQQuestionText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 22,
  },
});
