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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { statsApi, GrammarStatsOverview, CategoryStats } from '../api/statsApi';
import { DonutChart } from '../components/shared/DonutChart';

const { width } = Dimensions.get('window');

type GrammarStatsOverviewScreenProps = {
  onBack: () => void;
  onNavigateToPracticeDetail: (practiceId: number) => void;
  onNavigateToTopicPractices: (topicId: number) => void;
};

export const GrammarStatsOverviewScreen: React.FC<GrammarStatsOverviewScreenProps> = ({ 
  onBack, 
  onNavigateToPracticeDetail,
  onNavigateToTopicPractices
}) => {
  const [stats, setStats] = useState<GrammarStatsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsApi.getGrammarOverview();
      setStats(data);
    } catch (error) {
      console.error("Failed to load grammar stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDonutChart = () => {
    if (!stats) return null;
    
    const chartData = stats.categories.map(cat => ({
      value: cat.completedCount,
      color: cat.color
    }));

    return (
      <DonutChart
        data={chartData}
        centerLabel="TỔNG BÀI"
        centerValue={stats.totalLessons || 0}
        centerSubLabel={stats.newLessonsThisWeek > 0 ? `+${stats.newLessonsThisWeek} tuần này` : undefined}
      />
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Overlays */}
      <View style={[styles.blob, styles.blobOrange, { top: -150, right: -50 }]} />
      <View style={[styles.blob, styles.blobGreen, { bottom: 100, left: -50 }]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê ngữ pháp</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            {renderDonutChart()}
          </View>

          <View style={styles.legendContainer}>
            {stats?.categories.map((category, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={styles.legendLabelGroup}>
                  <View style={[styles.legendDot, { backgroundColor: category.color }]} />
                  <Text style={styles.legendName} numberOfLines={1}>{category.name}</Text>
                </View>
                <Text style={styles.legendPercentage}>{category.percentage}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Topics Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chủ điểm ngữ pháp</Text>
        </View>

        {stats?.categories.map((category, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.topicCard}
            onPress={() => onNavigateToTopicPractices(category.categoryId)}
          >
            <View style={styles.topicTop}>
              <View style={[styles.topicIconWrapper, { backgroundColor: category.color + '15' }]}>
                <MaterialCommunityIcons name={category.iconName as any} size={24} color={category.color} />
              </View>
              <View style={topicStyles.topicInfo}>
                <Text style={styles.topicTitle}>{category.name}</Text>
                <Text style={styles.topicSubtitle}>Học lại các bài đã luyện tập</Text>
              </View>
              <View style={styles.chevronBtn}>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </View>

            <View style={styles.examsRow}>
              {category.recentLessons.map((lesson, eIndex) => (
                <TouchableOpacity 
                   key={eIndex} 
                   style={styles.examBadge}
                   onPress={() => onNavigateToPracticeDetail(lesson.id)}
                >
                  <Text style={styles.examBadgeText} numberOfLines={1}>{lesson.title}</Text>
                </TouchableOpacity>
              ))}
              {category.moreCount > 0 && (
                <Text style={styles.moreExamsText}>+{category.moreCount} nữa</Text>
              )}
            </View>
          </TouchableOpacity>
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
    backgroundColor: '#F8F9FD',
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
  },
  blobOrange: {
    backgroundColor: '#F59E0B',
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 30,
    shadowColor: '#F59E0B',
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
  circularChartContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chartInner: {
    position: 'absolute',
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
    flex: 1,
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
    flex: 1,
  },
  legendPercentage: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '900',
    marginLeft: 10,
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
    flexWrap: 'wrap',
  },
  examBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    maxWidth: '45%',
  },
  examBadgeText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  moreExamsText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 'auto',
    fontWeight: '600',
  },
});
