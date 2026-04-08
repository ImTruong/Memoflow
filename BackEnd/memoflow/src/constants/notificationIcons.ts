// Notification icon mapping based on notification type
// Maps to backend NotificationType enum

export type NotificationIconType = 'book' | 'fire' | 'stars' | 'trophy' | 'bell';

export interface NotificationIconConfig {
  icon: NotificationIconType;
  iconFamily: 'FontAwesome5' | 'MaterialCommunityIcons' | 'Ionicons';
  iconName: string;
  bgColor: string;
  iconColor: string;
  hasGradient: boolean;
  gradientColors?: string[];
  titleColor?: string;
}

export const NOTIFICATION_ICONS: Record<string, NotificationIconConfig> = {
  STUDY_REMINDER: {
    icon: 'book',
    iconFamily: 'FontAwesome5',
    iconName: 'book-open',
    bgColor: '#FFF7ED',
    iconColor: '#F97316',
    hasGradient: false,
    titleColor: '#1F2937',
  },
  STREAK_REMINDER: {
    icon: 'fire',
    iconFamily: 'FontAwesome5',
    iconName: 'fire',
    bgColor: '#DCFCE7',
    iconColor: '#FFFFFF',
    hasGradient: true,
    gradientColors: ['#4ADE80', '#22C55E', '#16A34A'],
    titleColor: '#16A34A',
  },
  NEW_VOCABULARY: {
    icon: 'stars',
    iconFamily: 'MaterialCommunityIcons',
    iconName: 'star-four-points',
    bgColor: '#F3E8FF',
    iconColor: '#A855F7',
    hasGradient: false,
    titleColor: '#A855F7',
  },
  ACHIEVEMENT: {
    icon: 'trophy',
    iconFamily: 'FontAwesome5',
    iconName: 'trophy',
    bgColor: '#E3F2FD',
    iconColor: '#2196F3',
    hasGradient: false,
    titleColor: '#2196F3',
  },
  GENERAL: {
    icon: 'bell',
    iconFamily: 'Ionicons',
    iconName: 'notifications',
    bgColor: '#F5F5F5',
    iconColor: '#757575',
    hasGradient: false,
    titleColor: '#1F2937',
  },
};

export const getNotificationIconConfig = (type: string): NotificationIconConfig => {
  return NOTIFICATION_ICONS[type?.toUpperCase()] || NOTIFICATION_ICONS.GENERAL;
};

// Action button config for specific notification types
export const NOTIFICATION_ACTIONS: Record<string, { hasAction: boolean; actionText: string; actionBgColor: string; actionTextColor: string }> = {
  STREAK_REMINDER: { hasAction: true, actionText: 'Học ngay', actionBgColor: '#FFFFFF', actionTextColor: '#F97316' },
  STUDY_REMINDER: { hasAction: false, actionText: '', actionBgColor: '', actionTextColor: '' },
  NEW_VOCABULARY: { hasAction: false, actionText: '', actionBgColor: '', actionTextColor: '' },
  ACHIEVEMENT: { hasAction: false, actionText: '', actionBgColor: '', actionTextColor: '' },
  GENERAL: { hasAction: false, actionText: '', actionBgColor: '', actionTextColor: '' },
};

export const getNotificationAction = (type: string) => {
  return NOTIFICATION_ACTIONS[type?.toUpperCase()] || NOTIFICATION_ACTIONS.GENERAL;
};
