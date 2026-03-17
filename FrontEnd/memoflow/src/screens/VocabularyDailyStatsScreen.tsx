import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { CenteredLoader } from '../components/shared/ScreenState';
import { flashcardApi } from '../api/flashcardApi';
import { FlashcardReviewResponse } from '../types/flashcard';
import { getBadgeStyle, getDifficultyChartData } from '../utils/difficultyUtils';

const { width } = Dimensions.get('window');

type VocabularyDailyStatsScreenProps = {
  onBack: () => void;
  date: string;
};

export const VocabularyDailyStatsScreen: React.FC<VocabularyDailyStatsScreenProps> = ({ onBack, date }) => {
  const [history, setHistory] = useState<FlashcardReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // API expects YYYY-MM-DD
      const res = await flashcardApi.getReviewHistory(date, 0, 100);
      if (res.success) {
        setHistory(res.data.content);
      }
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = getDifficultyChartData(history, 120, {
    veryHard: 'Very Hard',
    hard: 'Hard',
    easy: 'Easy',
    veryEasy: 'Very Easy',
  });

  if (loading) return <CenteredLoader />;

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blobBlue, { top: -100, right: -100 }]} />
      <View style={[styles.blob, styles.blobGreen, { bottom: 200, left: -100 }]} />

      <ScreenHeader
        title={`Thống kê ngày ${new Date(date).toLocaleDateString('vi-VN')}`}
        onBack={onBack}
        titleStyle={styles.headerTitle}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Tổng số từ đã học</Text>
          <View style={styles.summaryValueContainer}>
            <Text style={styles.summaryValue}>{history.length}</Text>
            <Text style={styles.summaryUnit}>từ</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Phân bổ độ khó</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.chartColumn}>
                <Text style={[styles.chartCount, { color: item.color }]}>{item.count}</Text>
                <View style={styles.barWrapper}>
                  <View style={styles.barBackground} />
                  <View style={[styles.barFill, { height: item.height, backgroundColor: item.color }]} />
                </View>
                <Text style={styles.chartLabel}>{item.label.split(' ').join('\n')}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Lịch sử học tập</Text>
        <View style={styles.historySection}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>Không tìm thấy dữ liệu cho ngày này</Text>
          ) : (
            history.map((item, index) => {
              const s = getBadgeStyle(item.difficulty);
              const isLast = index === history.length - 1;
              const time = new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
              return (
                <View key={item.id} style={[styles.historyRow, !isLast && styles.rowDivider]}>
                  <Text style={styles.historyTime}>{time}</Text>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyWord}>{item.wordName}</Text>
                    <Text style={styles.historyType} numberOfLines={1}>{item.wordDefinition}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  blob: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.1 },
  blobBlue: { backgroundColor: '#3B82F6' },
  blobGreen: { backgroundColor: '#10B981' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 30, padding: 30, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  summaryLabel: { fontSize: 16, color: '#6B7280', fontWeight: '600', marginBottom: 10 },
  summaryValueContainer: { flexDirection: 'row', alignItems: 'baseline' },
  summaryValue: { fontSize: 56, fontWeight: '900', color: '#10B981' },
  summaryUnit: { fontSize: 20, color: '#6B7280', marginLeft: 8, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  chartCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 180 },
  chartColumn: { alignItems: 'center', width: (width - 88) / 4 },
  chartCount: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  barWrapper: { width: 44, height: 120, justifyContent: 'flex-end', alignItems: 'center', position: 'relative' },
  barBackground: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#F8FAFC', borderRadius: 25 },
  barFill: { width: '100%', borderRadius: 25 },
  chartLabel: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 12, fontWeight: '700', height: 30 },
  historySection: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 18 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  historyTime: { fontSize: 14, color: '#9CA3AF', width: 50 },
  historyInfo: { flex: 1 },
  historyWord: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  historyType: { fontSize: 13, color: '#9CA3AF' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '900' },
  emptyText: { textAlign: 'center', padding: 20, color: '#9CA3AF', fontSize: 14 }
});
