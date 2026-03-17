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
import { getBadgeStyleAlt, getDifficultyChartData } from '../utils/difficultyUtils';

const { width } = Dimensions.get('window');

type WordDetailStatsScreenProps = {
  onBack: () => void;
  word?: string;
};

export const WordDetailStatsScreen: React.FC<WordDetailStatsScreenProps> = ({ onBack, word = 'Destination' }) => {
  const [history, setHistory] = useState<FlashcardReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (word) fetchData();
  }, [word]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await flashcardApi.searchReviews(word, 0, 100);
      if (res.success) {
        setHistory(res.data.content);
      }
    } catch (error) {
      console.error('Error fetching word stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = getDifficultyChartData(history, 60);
  const wordInfo = history[0];

  if (loading) return <CenteredLoader />;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Lịch sử ôn tập"
        onBack={onBack}
        titleStyle={styles.headerTitle}
        withBorder={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Word Card */}
        <View style={styles.wordCard}>
          <Text style={styles.wordTitle}>{word}</Text>
          <Text style={styles.phoneticText}>{wordInfo?.wordIPA ? `/${wordInfo.wordIPA}/` : ''}</Text>
          
          <View style={styles.badgeContainer}>
            <View style={styles.countBadge}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.countBadgeText}>{history.length} lần ôn</Text>
            </View>
            
            <View style={styles.nextReviewBadge}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.nextReviewText}>
                Next Review: {wordInfo?.nextReviewDate ? new Date(wordInfo.nextReviewDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
              </Text>
            </View>
          </View>
        </View>

        {/* Section: THỐNG KÊ */}
        <Text style={styles.sectionTitle}>THỐNG KÊ</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.chartColumn}>
                <Text style={styles.chartCount}>{item.count}</Text>
                <View style={styles.barWrapper}>
                  <View style={styles.barBackground} />
                  <View style={[styles.barFill, { height: item.height, backgroundColor: item.color }]} />
                </View>
                <Text style={styles.chartLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section: CHI TIẾT LỊCH SỬ */}
        <Text style={styles.sectionTitle}>CHI TIẾT LỊCH SỬ</Text>
        <View style={styles.timelineContainer}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
          ) : (
            history.map((r) => {
              const s = getBadgeStyleAlt(r.difficulty);
              const dateStr = new Date(r.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
              return (
                <View key={r.id} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { borderColor: s.text }]} />
                  <Text style={styles.timelineDateText}>Ngày {dateStr.replace(',', ' -')}</Text>
                  <View style={[styles.diffBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.diffBadgeText, { color: s.text }]}>{s.label}</Text>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  wordCard: { backgroundColor: '#FFFFFF', borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  wordTitle: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, textAlign: 'center' },
  phoneticText: { fontSize: 18, color: '#60A5FA', marginBottom: 20, textAlign: 'center' },
  badgeContainer: { alignItems: 'center', gap: 12 },
  countBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  countBadgeText: { fontSize: 13, color: '#6B7280', fontWeight: 'bold' },
  nextReviewBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, gap: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  nextReviewText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 16, marginTop: 8 },
  chartCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  chartColumn: { alignItems: 'center', flex: 1 },
  chartCount: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', marginBottom: 8 },
  barWrapper: { width: 50, height: 70, justifyContent: 'flex-end', backgroundColor: '#F8FAFC', borderRadius: 12, overflow: 'hidden' },
  barBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: '#F1F5F9' },
  barFill: { width: '100%', borderRadius: 10 },
  chartLabel: { fontSize: 10, color: '#94A3B8', marginTop: 12, fontWeight: 'bold' },
  timelineContainer: { gap: 20 },
  timelineItem: { flexDirection: 'row', alignItems: 'center' },
  timelineDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: '#FFF', marginRight: 15 },
  timelineDateText: { flex: 1, fontSize: 16, color: '#475569', fontWeight: '600' },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  diffBadgeText: { fontSize: 10, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', padding: 20, color: '#9CA3AF' }
});
