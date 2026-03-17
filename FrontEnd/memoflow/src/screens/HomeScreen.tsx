import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { DailyGoal } from '../components/DailyGoal';
import { DiscoverLessons } from '../components/DiscoverLessons';
import { AdvancedLearning } from '../components/AdvancedLearning';
import { NotificationOverlay } from '../components/NotificationOverlay';
import { colors } from '../theme/colors';

import { useUser } from '../hooks/useUser';
import { useDailyStats } from '../hooks/useDailyStats';

type HomeScreenProps = {
  onNavigateToNotifications: () => void;
  onNavigateToLearning: () => void;
  onNavigateToGlobalStudy: () => void;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onNavigateToNotifications, 
  onNavigateToLearning, 
  onNavigateToGlobalStudy 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { profile } = useUser();
  const { reviewedTodayCount, dueTodayCount, totalReviewsCount, isLoading } = useDailyStats();

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
        >
          {totalReviewsCount > 0 && !isLoading && (
            <DailyGoal 
              percentage={dueTodayCount > 0 ? (reviewedTodayCount / (reviewedTodayCount + dueTodayCount)) * 100 : 100}
              completedWords={reviewedTodayCount}
              totalWords={reviewedTodayCount + dueTodayCount}
              onPress={onNavigateToGlobalStudy}
            />
          )}
          <DiscoverLessons onNavigateToLearning={onNavigateToLearning} />
          <AdvancedLearning />
        </ScrollView>

        {showNotifications && (
          <NotificationOverlay 
            onClose={() => setShowNotifications(false)} 
            onSeeAll={onNavigateToNotifications}
          />
        )}

        {/* Floating Action Button (FAB) for Chat bot */}
        <TouchableOpacity style={styles.fab}>
          <MaterialCommunityIcons name="chat-processing" size={28} color="#FFF" />
        </TouchableOpacity>
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 80,
  },
});
