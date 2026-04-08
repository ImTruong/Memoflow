import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { statsApi, VocabularyStatsOverview, VocabCategoryStats } from '../api/statsApi';
import { DonutChart } from '../components/shared/DonutChart';

type Props = {
  onBack: () => void;
  onNavigateToCategoryHistory: (categoryId: number) => void;
  onNavigateToSetDetail: (setId: number) => void;
  onNavigateToHistory: () => void;
};

export const VocabularyStatsOverviewScreen: React.FC<Props> = ({ 
  onBack, 
  onNavigateToCategoryHistory,
  onNavigateToSetDetail,
  onNavigateToHistory
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<VocabularyStatsOverview | null>(null);

  const fetchData = async () => {
    try {
      const res = await statsApi.getVocabularyOverview();
      setData(res);
    } catch (err) {
      console.error('Error fetching vocabulary stats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const chartData = data?.categories.map(c => ({
    value: c.completedCount,
    color: c.color,
  })) || [];

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Thống kê Từ vựng" 
        onBack={onBack} 
        rightContent={
          <TouchableOpacity onPress={onNavigateToHistory}>
            <MaterialCommunityIcons name="history" size={24} color="#64748B" />
          </TouchableOpacity>
        }
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.mainCard}>
          <View style={styles.chartSection}>
            <DonutChart 
              data={chartData} 
              centerLabel="TỔNG BỘ"
              centerValue={data?.totalSetsLearned || 0}
              centerSubLabel={data && data.newWordsThisWeek > 0 ? `+${data.newWordsThisWeek} tuần này` : undefined}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Học gần đây</Text>
              <Text style={[styles.summaryValue, { color: '#3B82F6' }]}>
                +{data?.newWordsThisWeek || 0}
              </Text>
              <Text style={styles.summaryUnit}>từ mới tuần này</Text>
            </View>
            <View style={styles.summaryVerticalDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Hoàn thành</Text>
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                {data?.totalSetsLearned || 0}
              </Text>
              <Text style={styles.summaryUnit}>bộ từ học xong</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Các hạng mục từ vựng</Text>
        
        {data?.categories.map((category, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.categoryCard}
            onPress={() => onNavigateToCategoryHistory(category.categoryId)}
          >
            <View style={styles.categoryHeader}>
              <View style={[styles.iconBox, { backgroundColor: category.color + '15' }]}>
                <Ionicons name={category.iconName as any} size={24} color={category.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>Đã học xong: {category.completedCount} bộ</Text>
              </View>
              <View style={styles.percentageBox}>
                <Text style={[styles.percentageText, { color: category.color }]}>{category.percentage}</Text>
              </View>
            </View>

            {category.recentSets.length > 0 && (
              <View style={styles.recentList}>
                {category.recentSets.map((set) => (
                  <TouchableOpacity 
                    key={set.id} 
                    style={styles.recentItem}
                    onPress={() => onNavigateToSetDetail(set.id)}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.recentItemText} numberOfLines={1}>{set.title}</Text>
                    <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
                {category.moreCount > 0 && (
                  <Text style={styles.moreText}>+ {category.moreCount} bộ từ khác</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  mainCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3
  },
  chartSection: { alignItems: 'center', marginBottom: 24 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold', marginBottom: 4 },
  summaryValue: { fontSize: 24, fontWeight: '900' },
  summaryUnit: { fontSize: 11, color: '#64748B', marginTop: 2 },
  summaryVerticalDivider: { width: 1, height: 40, backgroundColor: '#F1F5F9' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  categoryCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  categoryHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  categoryCount: { fontSize: 13, color: '#64748B', marginTop: 2 },
  percentageBox: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F8FAFC' },
  percentageText: { fontSize: 14, fontWeight: '900' },
  recentList: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  recentItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    padding: 10, 
    borderRadius: 12, 
    marginBottom: 8 
  },
  recentItemText: { flex: 1, fontSize: 13, color: '#475569', marginLeft: 8 },
  moreText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4, fontStyle: 'italic' }
});
