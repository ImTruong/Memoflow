export const colors = {
  background: '#FFFFFF',
  surface: '#F5F7FA', // Default light background for some sections
  primary: '#5B62E3', // The blue/purple for the streak and primary buttons
  secondary: '#50E3C2', // The green used in "Từ vựng"
  textPrimary: '#1F2937', // Dark gray for main text
  textSecondary: '#6B7280', // Lighter gray for subtext
  warning: '#F5A623', // Orange for the "Ngữ pháp" box and flame
  info: '#4A90E2', // Blue for "Luyện nghe" box
  danger: '#FF6B6B', // Red for notification badge
  cardBackgrounds: {
    purpleLight: '#EBEBFF',
    greenLight: '#E8F8F5',
    orangeLight: '#FFF5E6',
    blueLight: '#E6F4FF',
    notificationBlue: '#E0E7FF',
    notificationOrange: '#FFEDD5',
    notificationPurple: '#F3E8FF',
  },
  border: '#E5E7EB',
};

import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
  },
  body1: {
    fontSize: 16,
  },
  body2: {
    fontSize: 14,
  },
  caption: {
    fontSize: 12,
  },
};
