import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, Animated } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { sendLocalNotification } from '../services/pushNotification';

type HeaderProps = {
  userName: string;
  streakDays: number;
  avatarUrl?: string;
  notificationCount: number;

  showNotifications: boolean;
  onToggleNotifications: () => void;
  
  // New props for flexibility
  title?: string;
  subtitle?: string;
  titleMode?: boolean;
  centerTitle?: boolean;
};

export const Header: React.FC<HeaderProps> = ({ 
  userName, 
  streakDays, 
  avatarUrl,
  notificationCount,
  showNotifications,
  onToggleNotifications,
  title,
  subtitle,
  titleMode = false,
  centerTitle = false
}) => {
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const prevNotificationCount = useRef(notificationCount);

  // Animation logic (unchanged)
  React.useEffect(() => {
    const hasNewNotification = notificationCount > prevNotificationCount.current;
    prevNotificationCount.current = notificationCount;
    
    if (notificationCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnimation, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      if (hasNewNotification) {
        Animated.sequence([
          Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
      }
    } else {
      pulseAnimation.stopAnimation();
      pulseAnimation.setValue(1);
    }
  }, [notificationCount]);

  const handlePressIn = () => {
    const now = Date.now();
    setPressStartTime(now);
    longPressTimer.current = setTimeout(() => {
      sendLocalNotification(
        '🎉 Test Notification',
        'Đây là thông báo test! Bạn đã giữ avatar trong 10 giây.',
        { type: 'test', timestamp: new Date().toISOString() }
      ).catch(console.error);
    }, 10000);
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressStartTime(null);
  };

  return (
    <View style={[styles.container, centerTitle && styles.centerContainer]}>
      {titleMode ? (
        <View style={[styles.titleSection, centerTitle && { flex: 1, alignItems: 'center', marginLeft: 44 }]}>
          <Text style={styles.headerTitleText}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitleText}>{subtitle}</Text>}
        </View>
      ) : (
        <View style={styles.userInfo}>
          <Pressable 
            style={styles.avatarWrapper}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Image 
              source={{ uri: avatarUrl || 'https://i.pravatar.cc/100?img=11' }} 
              style={styles.avatar} 
            />
            <View style={styles.onlineDot} />
          </Pressable>
          <View>
            <Text style={styles.greeting}>Chào buổi sáng!</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>
      )}

      <View style={styles.rightActions}>
        {!centerTitle && (
          <View style={styles.streakContainer}>
            <FontAwesome5 name="fire" size={16} color={colors.warning} />
            <Text style={styles.streakText}>{streakDays} Ngày</Text>
          </View>
        )}
        
        <Animated.View style={{ transform: [{ translateX: shakeAnimation }, { scale: pulseAnimation }] }}>
          <TouchableOpacity 
            style={[styles.notificationBtn, showNotifications && styles.activeNotificationBtn]}
            onPress={onToggleNotifications}
          >
            <Ionicons 
              name={notificationCount > 0 ? "notifications-sharp" : "notifications-outline"} 
              size={24} 
              color={notificationCount > 0 || showNotifications ? colors.primary : '#4B5563'} 
            />
            {notificationCount > 0 && (
              <Animated.View style={[styles.badge, { transform: [{ scale: pulseAnimation }] }]}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  centerContainer: {
    justifyContent: 'space-between',
  },
  titleSection: {
    justifyContent: 'center',
  },
  headerTitleText: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerSubtitleText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE8D6',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: '600'
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackgrounds.orangeLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  streakText: {
    color: colors.warning,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  notificationBtn: {
    position: 'relative',
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activeNotificationBtn: {
    backgroundColor: '#F5F3FF',
    borderColor: '#E0E7FF',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4B4B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
