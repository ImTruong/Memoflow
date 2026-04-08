import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { NotificationOverlay } from '../components/NotificationOverlay';
import { useNotifications } from '../hooks/useNotifications';
import { Header } from '../components/Header';
import { useUser } from '../hooks/useUser';
import { statsApi, OverviewStats } from '../api/statsApi';
import { DonutChart } from '../components/shared/DonutChart';

const { width } = Dimensions.get('window');

type StatsScreenProps = {
  onNavigateToNotifications: () => void;
  onNavigateToVocabularyStats: () => void;
  onNavigateToListeningStats: () => void;
  onNavigateToGrammarStats: () => void;
};

export const StatsScreen: React.FC<StatsScreenProps> = ({ 
  onNavigateToNotifications, 
  onNavigateToVocabularyStats,
  onNavigateToListeningStats,
  onNavigateToGrammarStats
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications();
  const { profile } = useUser();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsApi.getOverview();
      setStats(data);
    } catch (error) {
      console.error("Failed to load overview stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDonutChart = () => {
    if (!stats) return null;

    const data = [
      { value: stats.vocabularyCount, color: '#3B82F6' },
      { value: stats.grammarCount, color: '#10B981' },
      { value: stats.listeningCount, color: '#A855F7' }
    ];

    return (
      <DonutChart
        data={data}
        centerValue={stats.totalActivities || 0}
        centerSubLabel="Hoạt động"
      />
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        userName={profile?.name || "Người dùng"}
        streakDays={profile?.streakDays || 0}
        avatarUrl={profile?.avatar}
        notificationCount={unreadCount}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        titleMode={true}
        title="Thống kê"
        subtitle="Tổng quan học tập"
      />

      <View style={styles.contentWrapper}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={!showNotifications}
        >
          {/* Today's Activity Card */}
          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Text style={styles.sectionTitle}>Hôm nay</Text>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>{stats?.todayDate || "Đang tải..."}</Text>
              </View>
            </View>

            <View style={styles.chartContainer}>
              {renderDonutChart()}
            </View>

            <View style={styles.legendRow}>
              <View style={[styles.legendItem, { backgroundColor: '#EFF6FF' }]}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendLabel}>TỪ VỰNG</Text>
                <Text style={styles.legendValue}>{stats?.vocabularyCount || 0} bộ</Text>
              </View>
              <View style={[styles.legendItem, { backgroundColor: '#F0FDF4' }]}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendLabel}>NGỮ PHÁP</Text>
                <Text style={styles.legendValue}>{stats?.grammarCount || 0} bài</Text>
              </View>
              <View style={[styles.legendItem, { backgroundColor: '#FAF5FF' }]}>
                <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
                <Text style={styles.legendLabel}>NGHE</Text>
                <Text style={styles.legendValue}>{stats?.listeningCount || 0} bài</Text>
              </View>
            </View>
          </View>

          {/* Detailed Stats Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitleMain}>Chi tiết thống kê</Text>
            
            {/* Vocabulary Detailed Card */}
            <TouchableOpacity style={styles.detailCard} onPress={onNavigateToVocabularyStats}>
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="book-outline" size={24} color="#3B82F6" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Thống kê Từ vựng</Text>
                  <Text style={styles.cardSubtitle}>Xem tiến độ học từ mới và ôn tập</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </View>
              <View style={styles.miniChartContainer}>
                {(stats?.weeklyActivity || [0, 0, 0, 0, 0, 0, 0]).map((h, i) => {
                  const maxH = Math.max(...(stats?.weeklyActivity || [1]));
                  const height = maxH === 0 ? 0 : (h / maxH) * 30;
                  return (
                    <View 
                      key={i} 
                      style={[
                        styles.miniBar, 
                        { height: Math.max(2, height), backgroundColor: i === 6 ? '#3B82F6' : '#EFF6FF' }
                      ]} 
                    />
                  );
                })}
              </View>
            </TouchableOpacity>

            {/* Grammar Detailed Card */}
            <TouchableOpacity style={styles.detailCard} onPress={onNavigateToGrammarStats}>
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="pencil-outline" size={24} color="#10B981" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Thống kê Ngữ pháp</Text>
                  <Text style={styles.cardSubtitle}>Theo dõi các cấu trúc đã học</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </View>
              <View style={styles.miniChartContainer}>
                {(stats?.weeklyActivity || [0, 0, 0, 0, 0, 0, 0]).map((h, i) => {
                   const maxH = Math.max(...(stats?.weeklyActivity || [1]));
                   const height = maxH === 0 ? 0 : (h / maxH) * 30;
                   return (
                    <View 
                      key={i} 
                      style={[
                        styles.miniBar, 
                        { height: Math.max(2, height), backgroundColor: i === 6 ? '#10B981' : '#F0FDF4' }
                      ]} 
                    />
                  );
                })}
              </View>
            </TouchableOpacity>

            {/* Listening Detailed Card */}
            <TouchableOpacity style={styles.detailCard} onPress={onNavigateToListeningStats}>
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: '#FAF5FF' }]}>
                  <Ionicons name="headset-outline" size={24} color="#A855F7" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Thống kê Nghe</Text>
                  <Text style={styles.cardSubtitle}>Thời gian và bài nghe hoàn thành</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </View>
              <View style={styles.miniChartContainer}>
                {(stats?.weeklyActivity || [0, 0, 0, 0, 0, 0, 0]).map((h, i) => {
                   const maxH = Math.max(...(stats?.weeklyActivity || [1]));
                   const height = maxH === 0 ? 0 : (h / maxH) * 30;
                   return (
                    <View 
                      key={i} 
                      style={[
                        styles.miniBar, 
                        { height: Math.max(2, height), backgroundColor: i === 6 ? '#A855F7' : '#FAF5FF' }
                      ]} 
                    />
                  );
                })}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showNotifications && (
          <NotificationOverlay 
            onClose={() => setShowNotifications(false)} 
            onSeeAll={onNavigateToNotifications}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 30,
    marginTop: 10,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  dateBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
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
  chartNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chartSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: -4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 10,
  },
  legendItem: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  legendLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  detailsSection: {
    width: '100%',
  },
  sectionTitleMain: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  miniChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    marginTop: 20,
    gap: 4,
  },
  miniBar: {
    flex: 1,
    borderRadius: 4,
  },
});
