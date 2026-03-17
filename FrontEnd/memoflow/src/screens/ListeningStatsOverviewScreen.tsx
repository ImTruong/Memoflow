import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type ListeningStatsOverviewScreenProps = {
  onBack: () => void;
  onNavigateToExamDetail: (examId: string) => void;
};

export const ListeningStatsOverviewScreen: React.FC<ListeningStatsOverviewScreenProps> = ({ 
  onBack, 
  onNavigateToExamDetail 
}) => {
  const parts = [
    { name: 'Part 1: Mô tả hình ảnh', percentage: '25%', color: '#818CF8' },
    { name: 'Part 2: Hỏi & Đáp', percentage: '35%', color: '#34D399' },
    { name: 'Part 3: Đoạn hội thoại', percentage: '25%', color: '#FBBF24' },
    { name: 'Part 4: Bài nói ngắn', percentage: '15%', color: '#F472B6' },
  ];

  const topics = [
    { 
      id: 'p1', 
      title: 'Part 1: Mô tả hình ảnh', 
      subtitle: 'Photographs', 
      exams: ['Đề 01', 'Đề 02', 'Đề 05'], 
      moreCount: 9,
      iconColor: '#818CF8',
      iconName: 'image-outline' 
    },
    { 
      id: 'p2', 
      title: 'Part 2: Hỏi & Đáp', 
      subtitle: 'Question & Response', 
      exams: ['Đề 03', 'Đề 04', 'Đề 08'], 
      moreCount: 15,
      iconColor: '#34D399',
      iconName: 'chatbubble-outline' 
    },
  ];

  return (
    <View style={styles.container}>
      {/* Background Overlays */}
      <View style={[styles.blob, styles.blobBlue, { top: -150, right: -50 }]} />
      <View style={[styles.blob, styles.blobGreen, { bottom: 100, left: -50 }]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê nghe</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            <View style={styles.circularChart}>
              {/* Fake segments using borders */}
              <View style={[styles.segment, { borderColor: '#818CF8', transform: [{ rotate: '0deg' }] }]} />
              <View style={[styles.segment, { borderColor: '#34D399', transform: [{ rotate: '90deg' }] }]} />
              <View style={[styles.segment, { borderColor: '#FBBF24', transform: [{ rotate: '180deg' }] }]} />
              <View style={[styles.segment, { borderColor: '#F472B6', transform: [{ rotate: '270deg' }] }]} />
              <View style={styles.chartInner}>
                <Text style={styles.totalExamsLabel}>TỔNG ĐỀ</Text>
                <Text style={styles.totalExamsValue}>48</Text>
                <Text style={styles.totalExamsGrowth}>+3 tuần này</Text>
              </View>
            </View>
          </View>

          <View style={styles.legendContainer}>
            {parts.map((part, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={styles.legendLabelGroup}>
                  <View style={[styles.legendDot, { backgroundColor: part.color }]} />
                  <Text style={styles.legendName}>{part.name}</Text>
                </View>
                <Text style={styles.legendPercentage}>{part.percentage}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Topics Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chủ đề luyện nghe</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {topics.map((topic, index) => (
          <View key={index} style={styles.topicCard}>
            <View style={styles.topicTop}>
              <View style={[styles.topicIconWrapper, { backgroundColor: topic.iconColor + '15' }]}>
                <Ionicons name={topic.iconName as any} size={24} color={topic.iconColor} />
              </View>
              <View style={topicStyles.topicInfo}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
              </View>
              <TouchableOpacity style={styles.chevronBtn}>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.examsRow}>
              {topic.exams.map((exam, eIndex) => (
                <TouchableOpacity 
                  key={eIndex} 
                  style={styles.examBadge}
                  onPress={() => onNavigateToExamDetail(exam)}
                >
                  <Text style={styles.examBadgeText}>{exam}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.moreExamsText}>+{topic.moreCount} nữa</Text>
            </View>
          </View>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const topicStyles = StyleSheet.create({
  topicInfo: {
    flex: 1,
    marginRight: 12,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD', // Subtle off-white/blueish background
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
  },
  blobBlue: {
    backgroundColor: '#3B82F6',
    opacity: 0.05,
  },
  blobGreen: {
    backgroundColor: '#10B981',
    opacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 30,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
    marginBottom: 32,
    marginTop: 10,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  circularChart: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 20,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  segment: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 20,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  chartInner: {
    alignItems: 'center',
  },
  totalExamsLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  totalExamsValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1E293B',
    marginVertical: -2,
  },
  totalExamsGrowth: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  legendContainer: {
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendName: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  legendPercentage: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  topicTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  topicIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  topicSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  chevronBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  examsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 20,
  },
  examBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
  },
  examBadgeText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  moreExamsText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 'auto',
    fontWeight: '600',
  },
});
