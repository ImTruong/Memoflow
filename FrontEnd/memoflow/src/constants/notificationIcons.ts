import { colors } from '../theme/colors';

type NotificationIconConfig = {
  iconName: string;
  iconFamily: 'Ionicons' | 'FontAwesome5';
  bgColor: string;
  iconColor: string;
  hasGradient?: boolean;
  gradientColors?: string[];
};

const defaultConfig: NotificationIconConfig = {
  iconName: 'bell',
  iconFamily: 'FontAwesome5',
  bgColor: colors.cardBackgrounds.notificationBlue,
  iconColor: colors.textSecondary,
};

const notificationIconMap: Record<string, NotificationIconConfig> = {
  STUDY_REMINDER: {
    iconName: 'book',
    iconFamily: 'FontAwesome5',
    bgColor: '#FFF3E0',
    iconColor: '#FF9800',
  },
  STREAK_REMINDER: {
    iconName: 'fire',
    iconFamily: 'FontAwesome5',
    bgColor: '#E8F5E9',
    iconColor: '#4CAF50',
    hasGradient: true,
    gradientColors: ['#4CAF50', '#66BB6A'],
  },
  NEW_VOCABULARY: {
    iconName: 'gift',
    iconFamily: 'FontAwesome5',
    bgColor: '#F3E5F5',
    iconColor: '#9C27B0',
  },
  ACHIEVEMENT: {
    iconName: 'trophy',
    iconFamily: 'FontAwesome5',
    bgColor: '#E3F2FD',
    iconColor: '#2196F3',
  },
  GENERAL: {
    iconName: 'bell',
    iconFamily: 'FontAwesome5',
    bgColor: '#F5F5F5',
    iconColor: '#757575',
  },
  // Legacy support (keep old names for backward compatibility)
  LEARNING_REMINDER: {
    iconName: 'book-open',
    iconFamily: 'FontAwesome5',
    bgColor: '#E8FDF5',
    iconColor: '#10B981',
  },
  NEW_LESSON: {
    iconName: 'sparkles',
    iconFamily: 'Ionicons',
    bgColor: colors.cardBackgrounds.notificationPurple,
    iconColor: '#8B5CF6',
  },
};

export const getNotificationIconConfig = (type?: string): NotificationIconConfig => {
  if (!type) return defaultConfig;
  return notificationIconMap[type] || defaultConfig;
};

