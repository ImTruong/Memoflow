import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationIconConfig } from '../constants/notificationIcons';

// Configure how notifications are handled when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Storage keys for notification settings
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

interface NotificationSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// Default settings
const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
};

// Get notification settings from storage
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

// Save notification settings
export const saveNotificationSettings = async (settings: Partial<NotificationSettings>) => {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    throw error;
  }
};

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    // Check current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Request if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }
    
    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Memoflow Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'default',
      });
      
      // Create specific channels for different notification types
      await Notifications.setNotificationChannelAsync('study_reminders', {
        name: 'Study Reminders',
        description: 'Reminders to continue your learning',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
      
      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Achievements',
        description: 'Achievement notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }
    
    console.log('Notification permissions granted');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Show a local push notification
export const showLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  try {
    const settings = await getNotificationSettings();
    const notificationType = data?.type || 'GENERAL';
    const iconConfig = getNotificationIconConfig(notificationType);
    
    // Determine channel based on notification type
    let channelId = 'default';
    if (notificationType === 'STUDY_REMINDER' || notificationType === 'STREAK_REMINDER') {
      channelId = 'study_reminders';
    } else if (notificationType === 'ACHIEVEMENT') {
      channelId = 'achievements';
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          ...data,
          iconConfig,
        },
        sound: settings.soundEnabled ? 'default' : undefined,
        badge: 1,
        ...(Platform.OS === 'android' && {
          color: iconConfig.iconColor,
        }),
      },
      trigger: null, // Show immediately
    });
    
    console.log('[Push] Notification shown:', title);
  } catch (error) {
    console.error('[Push] Error showing notification:', error);
  }
};

// Schedule a notification for later
export const scheduleNotification = async (
  title: string,
  body: string,
  triggerDate: Date,
  data?: Record<string, any>
) => {
  try {
    const settings = await getNotificationSettings();
    
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: settings.soundEnabled ? 'default' : undefined,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      } as any,
    });
    
    console.log('[Push] Notification scheduled:', identifier);
    return identifier;
  } catch (error) {
    console.error('[Push] Error scheduling notification:', error);
    return null;
  }
};

// Cancel a scheduled notification
export const cancelScheduledNotification = async (identifier: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log('[Push] Notification cancelled:', identifier);
  } catch (error) {
    console.error('[Push] Error cancelling notification:', error);
  }
};

// Cancel all scheduled notifications
export const cancelAllScheduledNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Push] All notifications cancelled');
  } catch (error) {
    console.error('[Push] Error cancelling all notifications:', error);
  }
};

// Get badge count
export const getBadgeCount = async (): Promise<number> => {
  return await Notifications.getBadgeCountAsync();
};

// Set badge count
export const setBadgeCount = async (count: number) => {
  await Notifications.setBadgeCountAsync(count);
};

// Clear badge
export const clearBadge = async () => {
  await Notifications.setBadgeCountAsync(0);
};

// Add listener for notification received while app is foregrounded
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(callback);
};

// Add listener for notification response (user tapped notification)
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Initialize notifications (call this on app start)
export const initializeNotifications = async () => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.warn('[Push] Notification permissions not granted');
  }
  return hasPermission;
};

// Legacy alias
export const sendLocalNotification = showLocalNotification;

