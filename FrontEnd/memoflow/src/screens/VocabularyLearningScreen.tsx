import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { Header } from '../components/Header';
import { NotificationOverlay } from '../components/NotificationOverlay';
import { LearningMethodCard } from '../components/LearningMethodCard';
import { colors } from '../theme/colors';

import { useUser } from '../hooks/useUser';
import { useDailyStats } from '../hooks/useDailyStats';
import { ActivityIndicator, TouchableOpacity } from 'react-native';

type VocabularyLearningScreenProps = {
  onNavigateToNotifications: () => void;
  onNavigateToFlashcards: () => void;
  onNavigateToGlobalStudy: () => void;
  onNavigateToStoryList: () => void;
  onNavigateToWordRaceList: () => void;
  onNavigateToWordHuntList: () => void;
  onNavigateToBilingual: () => void;
};

export const VocabularyLearningScreen: React.FC<VocabularyLearningScreenProps> = ({ 
  onNavigateToNotifications,
  onNavigateToFlashcards,
  onNavigateToGlobalStudy,
  onNavigateToStoryList,
  onNavigateToWordRaceList,
  onNavigateToWordHuntList,
  onNavigateToBilingual,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { profile } = useUser();
  const { reviewedTodayCount, dueTodayCount, totalReviewsCount, isLoading } = useDailyStats();

  const learningMethods = [
    {
      title: 'Flashcard',
      subtitle: 'Luyện nhớ nhanh qua thẻ',
      icon: 'card-multiple-outline',
      iconType: 'material' as const,
      iconColor: '#2DD4BF',
      backgroundColor: '#F0FDFA',
    },
    {
      title: 'Truyện chêm',
      subtitle: 'Học từ vựng qua ngữ cảnh',
      icon: 'book-open-outline',
      iconType: 'material' as const,
      iconColor: '#F59E0B',
      backgroundColor: '#FFFBEB',
    },
    {
      title: 'Bài đọc song ngữ',
      subtitle: 'Đọc hiểu Anh-Việt mỗi ngày',
      icon: 'translate',
      iconType: 'material' as const,
      iconColor: '#6366F1',
      backgroundColor: '#EEF2FF',
    },
    {
      title: 'Đua từ với Bot',
      subtitle: 'Thử thách tốc độ phản xạ',
      icon: 'robot-outline',
      iconType: 'material' as const,
      iconColor: '#F87171',
      backgroundColor: '#FEF2F2',
    },
    {
      title: 'Tinh mắt tìm từ',
      subtitle: 'Tìm từ ẩn trong mê cung',
      icon: 'magnify',
      iconType: 'material' as const,
      iconColor: '#A78BFA',
      backgroundColor: '#F5F3FF',
    },
  ];

  return (
    <View style={styles.container}>
      <Header 
        userName={profile?.name || "Người dùng"}
        streakDays={profile?.streakDays || 0}
        avatarUrl={profile?.avatar}
        notificationCount={3}



        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
      />
      
      <View style={styles.contentWrapper}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          scrollEnabled={!showNotifications}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.titlesContainer}>
            <Text style={styles.mainTitle}>Vocabulary Learning</Text>
            <Text style={styles.subSubtitle}>Hôm nay bạn muốn luyện tập gì?</Text>
          </View>

          {totalReviewsCount > 0 && !isLoading && (
            <TouchableOpacity 
              style={styles.progressCard} 
              onPress={onNavigateToGlobalStudy}
              activeOpacity={0.9}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Đã học hôm nay</Text>
                <View style={styles.percentageBadge}>
                  <Text style={styles.percentageText}>
                    {dueTodayCount > 0 ? Math.round((reviewedTodayCount / (reviewedTodayCount + dueTodayCount)) * 100) : 100}%
                  </Text>
                </View>
              </View>
              <Text style={styles.progressValue}>{reviewedTodayCount}/{reviewedTodayCount + dueTodayCount} từ vựng</Text>
              <View style={styles.progressBarContainer}>
                <View style={[
                  styles.progressBarFill, 
                  { width: `${dueTodayCount > 0 ? (reviewedTodayCount / (reviewedTodayCount + dueTodayCount)) * 100 : 100}%` }
                ]} />
              </View>
            </TouchableOpacity>
          )}

          {isLoading && totalReviewsCount === 0 && (
            <View style={[styles.progressCard, { alignItems: 'center', justifyContent: 'center' }]}>
              <ActivityIndicator color="#FFF" />
            </View>
          )}

          {/* Learning Methods List */}
          <View style={styles.methodsContainer}>
            {learningMethods.map((method, index) => (
              <LearningMethodCard 
                key={index}
                {...method}
                onPress={() => {
                  if (method.title === 'Flashcard') {
                    onNavigateToFlashcards();
                  } else if (method.title === 'Truyện chêm') {
                    onNavigateToStoryList();
                  } else if (method.title === 'Đua từ với Bot') {
                    onNavigateToWordRaceList();
                  }
                  else if (method.title === 'Tinh mắt tìm từ') {
                    onNavigateToWordHuntList();
                  } else if (method.title === 'Bài đọc song ngữ') {
                    onNavigateToBilingual();
                  }
                }}
              />
            ))}
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
    backgroundColor: colors.background,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  titlesContainer: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressCard: {
    backgroundColor: '#5B62E3',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#5B62E3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  percentageBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  percentageText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 5,
  },
  methodsContainer: {
    gap: 0,
  },
});
