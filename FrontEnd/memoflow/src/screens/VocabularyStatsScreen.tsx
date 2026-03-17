import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { flashcardApi } from '../api/flashcardApi';
import { FlashcardReviewResponse, HeatmapData, DailyStudyStats } from '../types/flashcard';
import { getBadgeStyle } from '../utils/difficultyUtils';

type VocabularyStatsScreenProps = {
  onBack: () => void;
  onNavigateToDailyStats: (date: string) => void;
  onNavigateToWordStats: (word: string) => void;
};

export const VocabularyStatsScreen: React.FC<VocabularyStatsScreenProps> = ({ 
  onBack, 
  onNavigateToDailyStats, 
  onNavigateToWordStats 
}) => {
  // Use today's date for initial heatmap
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState((now.getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString().slice(-2));

  const [stats, setStats] = useState<DailyStudyStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [history, setHistory] = useState<FlashcardReviewResponse[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  // Calculate heatmap cells
  const getHeatmapCells = () => {
    const year = parseInt(`20${selectedYear}`);
    const month = parseInt(selectedMonth);
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const cells = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({ dayNum: null, dateStr: null });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${selectedMonth.padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        cells.push({ dayNum: i, dateStr });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ dayNum: null, dateStr: null });
    }
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  };

  const heatmapWeeks = getHeatmapCells();

  React.useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsStatsLoading(true);
    try {
      const statsRes = await flashcardApi.getDailyStats();
      if (statsRes.success) setStats(statsRes.data);
      
      fetchHeatmap(parseInt(selectedMonth), parseInt(`20${selectedYear}`));
      fetchHistory(0);
    } catch (error) {
      console.error('Error fetching initial stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchHeatmap = async (month: number, year: number) => {
    try {
      const res = await flashcardApi.getHeatmapData(month, year);
      if (res.success) setHeatmapData(res.data);
    } catch (error) {
      console.error('Heatmap fetch error:', error);
    }
  };

  const fetchHistory = async (page = 0) => {
    setIsHistoryLoading(true);
    try {
      const res = await flashcardApi.getReviewHistory(undefined, page);
      if (res.success) {
        if (page === 0) setHistory(res.data.content);
        else setHistory(prev => [...prev, ...res.data.content]);
        setHistoryPage(res.data.pageNumber);
        setHistoryTotalPages(res.data.totalPages);
      }
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchHistory(0);
      return;
    }
    setIsHistoryLoading(true);
    try {
      const res = await flashcardApi.searchReviews(searchKeyword, 0);
      if (res.success) {
        setHistory(res.data.content);
        setHistoryPage(res.data.pageNumber);
        setHistoryTotalPages(res.data.totalPages);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const historyByDate = React.useMemo(() => {
    const groups: { [key: string]: { display: string, reviews: FlashcardReviewResponse[] } } = {};
    history.forEach(review => {
      const dateObj = new Date(review.createdAt);
      const isoDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      const displayDate = dateObj.toLocaleDateString('vi-VN');
      
      if (!groups[isoDate]) {
        groups[isoDate] = { display: displayDate, reviews: [] };
      }
      groups[isoDate].reviews.push(review);
    });
    return groups;
  }, [history]);

  const historyByWord = React.useMemo(() => {
    const groups: { [key: string]: FlashcardReviewResponse[] } = {};
    history.forEach(review => {
      const word = review.wordName;
      if (!groups[word]) groups[word] = [];
      groups[word].push(review);
    });
    return groups;
  }, [history]);

  const toggleDate = (date: string) => {
    setExpandedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };



  return (
    <View style={styles.container}>
      <ScreenHeader title="Thống kê từ vựng" onBack={onBack} titleStyle={styles.headerTitle} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#FFF2E6' }]}>
            <FontAwesome5 name="fire" size={18} color="#F97316" />
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Chuỗi học tập</Text>
              <Text style={styles.summaryValue}>{stats?.streakDays || 0} ngày</Text>
            </View>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#E1EFFF' }]}>
            <FontAwesome5 name="graduation-cap" size={18} color="#3B82F6" />
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Đã học hôm nay</Text>
              <Text style={styles.summaryValue}>{stats?.reviewedTodayCount || 0} từ</Text>
            </View>
          </View>
        </View>

        <View style={styles.heatmapCard}>
            <Text style={styles.sectionTitle}>Biểu đồ nhiệt - {selectedMonth}/20{selectedYear}</Text>
            <View style={styles.heatmapGrid}>
                {heatmapWeeks.map((week, wi) => (
                    <View key={wi} style={styles.heatmapRow}>
                        {week.map((cell, di) => {
                            if (!cell.dayNum) return <View key={di} style={styles.cellEmpty} />;
                            const data = heatmapData.find(h => h.date === cell.dateStr);
                            let color = '#F3F4F6';
                            if (data) color = data.reviewCount > 10 ? '#059669' : '#A7F3D0';
                            return (
                                <TouchableOpacity 
                                    key={di} 
                                    style={[styles.cell, { backgroundColor: color }]} 
                                    onPress={() => cell.dateStr && onNavigateToDailyStats(cell.dateStr)}
                                />
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>

        <Text style={styles.mainTitle}>Lịch sử theo ngày</Text>
        {Object.keys(historyByDate).map(isoDate => {
          const isExpanded = expandedDates.includes(isoDate);
          const { display, reviews } = historyByDate[isoDate];
          const day = display.split('/')[0];
          const displayReviews = reviews.slice(0, 3);
          
          return (
            <View key={isoDate} style={styles.accordion}>
              <TouchableOpacity onPress={() => toggleDate(isoDate)} style={styles.accordionHeader}>
                <View style={styles.dateCircle}><Text style={styles.dateNum}>{day}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateTitle}>{display.includes(new Date().toLocaleDateString('vi-VN')) ? 'Hôm nay' : display}</Text>
                  <Text style={styles.dateSubtitle}>Tháng {display.split('/')[1]}, 20{selectedYear}</Text>
                </View>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
              
              {isExpanded && (
                <View style={styles.accordionContent}>
                  {displayReviews.map((r, index) => {
                    const s = getBadgeStyle(r.difficulty);
                    const isLast = index === displayReviews.length - 1;
                    return (
                      <View key={r.id} style={[styles.historyRow, !isLast && styles.rowDivider]}>
                        <Text style={styles.historyTime}>
                            {new Date(r.createdAt).getHours()}:{new Date(r.createdAt).getMinutes().toString().padStart(2, '0')}
                        </Text>
                        <Text style={styles.historyWord}>{r.wordName}</Text>
                        <View style={[styles.badge, { backgroundColor: s.bg }]}>
                            <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
                        </View>
                      </View>
                    );
                  })}
                  
                  {reviews.length > 3 && (
                    <TouchableOpacity 
                        style={styles.detailPill} 
                        onPress={() => onNavigateToDailyStats(isoDate)}
                    >
                      <Text style={styles.detailPillText}>Xem chi tiết ngày này</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}

        <Text style={[styles.mainTitle, { marginTop: 20 }]}>Lịch sử theo từ</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput 
            value={searchKeyword} 
            onChangeText={setSearchKeyword} 
            placeholder="Tìm kiếm từ vựng..." 
            onSubmitEditing={handleSearch}
            style={styles.searchInput} 
          />
        </View>

        {Object.keys(historyByWord).map(word => (
          <View key={word} style={styles.wordCard}>
            <View style={styles.wordHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.wordName}>{word}</Text>
                <Text style={styles.wordMean}>{historyByWord[word][0].wordDefinition}</Text>
              </View>
              <TouchableOpacity 
                style={styles.historyIcon} 
                onPress={() => onNavigateToWordStats(word)}
              >
                <MaterialCommunityIcons name="history" size={24} color="#5B62E3" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerDivider} />
            
            <View style={styles.timeline}>
              {historyByWord[word].slice(0, 3).map((r, i) => {
                const s = getBadgeStyle(r.difficulty);
                return (
                  <View key={r.id} style={styles.timelineWrapper}>
                    <View style={styles.timelineItem}>
                      <View style={[styles.dot, { backgroundColor: s.dot }]} />
                      <Text style={styles.timelineDate}>
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={[styles.timelineStatus, { color: s.text }]}>{s.label}</Text>
                    </View>
                    {i < Math.min(historyByWord[word].length, 3) - 1 && <View style={styles.line} />}
                  </View>
                );
              })}
              
              {historyByWord[word].length > 3 && (
                <TouchableOpacity 
                    style={[styles.detailPill, { marginTop: 20 }]} 
                    onPress={() => onNavigateToWordStats(word)}
                >
                  <Text style={styles.detailPillText}>Xem lịch sử chi tiết</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {historyPage + 1 < historyTotalPages && (
            <TouchableOpacity style={styles.loadMore} onPress={() => fetchHistory(historyPage + 1)}>
                <Text style={styles.loadMoreText}>Tải thêm dữ liệu</Text>
            </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  scrollContent: { padding: 20 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryText: { flex: 1 },
  summaryLabel: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF' },
  summaryValue: { fontSize: 16, fontWeight: '900', color: '#1F2937' },
  heatmapCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  heatmapGrid: { gap: 4 },
  heatmapRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 4 },
  cellEmpty: { flex: 1, aspectRatio: 1 },
  mainTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  accordion: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16 },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dateCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBEBFF', justifyContent: 'center', alignItems: 'center' },
  dateNum: { fontSize: 18, fontWeight: 'bold', color: '#5B62E3' },
  dateTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  dateSubtitle: { fontSize: 13, color: '#9CA3AF' },
  accordionContent: { marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 18 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  historyTime: { fontSize: 14, color: '#9CA3AF', width: 50 },
  historyWord: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '900' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 20, height: 56, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1F2937' },
  wordCard: { backgroundColor: '#FFF', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  wordHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  headerDivider: { height: 1, backgroundColor: '#F8FAFC', marginBottom: 25 },
  wordName: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  wordMean: { fontSize: 16, color: '#9CA3AF' },
  historyIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  timeline: { paddingLeft: 8 },
  timelineWrapper: { position: 'relative' },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingVertical: 14 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  timelineDate: { flex: 1, fontSize: 16, color: '#666', fontWeight: '500' },
  timelineStatus: { fontSize: 16, fontWeight: 'bold' },
  line: { position: 'absolute', left: 4, top: 28, width: 2, height: 32, backgroundColor: '#F3F4F6', zIndex: -1 },
  detailPill: { alignSelf: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#EDF2F7', marginTop: 10 },
  detailPillText: { fontSize: 12, color: '#5B62E3', fontWeight: 'bold' },
  loadMore: { padding: 16, alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 16, marginTop: 10, marginBottom: 20 },
  loadMoreText: { color: '#5B62E3', fontWeight: 'bold', fontSize: 14 }
});

