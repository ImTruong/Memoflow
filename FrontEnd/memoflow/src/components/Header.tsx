import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';

type HeaderProps = {
  userName: string;
  streakDays: number;
  avatarUrl?: string;
  notificationCount: number;

  showNotifications: boolean;
  onToggleNotifications: () => void;
};

export const Header: React.FC<HeaderProps> = ({ 
  userName, 
  streakDays, 
  avatarUrl,
  notificationCount,
  showNotifications,
  onToggleNotifications
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatarWrapper}>
          <Image 
            source={{ uri: avatarUrl || 'https://i.pravatar.cc/100?img=11' }} 
            style={styles.avatar} 
          />

          <View style={styles.onlineDot} />
        </View>
        <View>
          <Text style={styles.greeting}>Chào buổi sáng!</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        <View style={styles.streakContainer}>
          <FontAwesome5 name="fire" size={16} color={colors.warning} />
          <Text style={styles.streakText}>{streakDays} Ngày</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.notificationBtn, showNotifications && styles.activeNotificationBtn]}
          onPress={onToggleNotifications}
        >
          <Ionicons 
            name="notifications" 
            size={24} 
            color={showNotifications ? colors.primary : colors.textPrimary} 
          />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
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
    backgroundColor: '#22C55E', // Green dot
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
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNotificationBtn: {
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
    borderColor: colors.background,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
