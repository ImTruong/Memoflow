import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { NotificationOverlay } from '../components/NotificationOverlay';

const { width } = Dimensions.get('window');

type StatsScreenProps = {
  onNavigateToNotifications: () => void;
  onNavigateToVocabularyStats: () => void;
  onNavigateToListeningStats: () => void;
};

export const StatsScreen: React.FC<StatsScreenProps> = ({ 
  onNavigateToNotifications, 
  onNavigateToVocabularyStats,
  onNavigateToListeningStats
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Thống kê</Text>
          <Text style={styles.headerSubtitle}>Tổng quan học tập</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.streakBadge}>
            <FontAwesome5 name="fire" size={16} color={colors.warning} />
            <Text style={styles.streakText}>12 Ngày</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.notifBtn, showNotifications && styles.activeNotifBtn]}
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <Ionicons 
              name="notifications" 
              size={24} 
              color={showNotifications ? colors.primary : colors.textPrimary} 
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

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
                <Text style={styles.dateText}>Thứ 3, 24/10</Text>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <View style={styles.circularChart}>
                <View style={[styles.chartSegment, { borderColor: '#3B82F6', borderTopColor: 'transparent', transform: [{ rotate: '45deg' }] }]} />
                <View style={[styles.chartSegment, { borderColor: '#10B981', borderLeftColor: 'transparent', borderTopColor: 'transparent', transform: [{ rotate: '-45deg' }] }]} />
                <View style={[styles.chartSegment, { borderColor: '#A855F7', borderRightColor: 'transparent', borderTopColor: 'transparent', transform: [{ rotate: '180deg' }] }]} />
                
                <View style={styles.chartInner}>
                  <Text style={styles.chartNumber}>6</Text>
                  <Text style={styles.chartSubtext}>Hoạt động</Text>
                </View>
              </View>
            </View>

            <View style={styles.legendRow}>
              <View style={[styles.legendItem, { backgroundColor: '#EFF6FF' }]}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendLabel}>TỪ VỰNG</Text>
                <Text style={styles.legendValue}>3 bộ</Text>
              </View>
              <View style={[styles.legendItem, { backgroundColor: '#F0FDF4' }]}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendLabel}>NGỮ PHÁP</Text>
                <Text style={styles.legendValue}>1 bài</Text>
              </View>
              <View style={[styles.legendItem, { backgroundColor: '#FAF5FF' }]}>
                <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
                <Text style={styles.legendLabel}>NGHE</Text>
                <Text style={styles.legendValue}>2 bài</Text>
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
                {[0.3, 0.5, 0.4, 0.6, 0.3, 0.7, 0.4, 0.8, 1].map((h, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.miniBar, 
                      { height: h * 30, backgroundColor: i === 8 ? '#3B82F6' : '#EFF6FF' }
                    ]} 
                  />
                ))}
              </View>
            </TouchableOpacity>

            {/* Grammar Detailed Card */}
            <TouchableOpacity style={styles.detailCard}>
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
                {[0.2, 0.3, 0.5, 0.2, 0.6, 0.4, 0.7, 0.3, 0.9].map((h, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.miniBar, 
                      { height: h * 30, backgroundColor: i === 8 ? '#10B981' : '#F0FDF4' }
                    ]} 
                  />
                ))}
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
                {[0.4, 0.2, 0.6, 0.3, 0.5, 0.7, 0.4, 0.6, 0.8].map((h, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.miniBar, 
                      { height: h * 30, backgroundColor: i === 8 ? '#A855F7' : '#FAF5FF' }
                    ]} 
                  />
                ))}
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
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    zIndex: 100,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackgrounds.orangeLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.warning,
    marginLeft: 6,
  },
  notifBtn: {
    position: 'relative',
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNotifBtn: {
    backgroundColor: colors.cardBackgrounds.purpleLight,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  circularChart: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 20,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chartSegment: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 20,
  },
  chartInner: {
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
