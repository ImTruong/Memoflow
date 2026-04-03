import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  setNotificationCallback,
  isWebSocketConnected 
} from '../services/websocket';
import { 
  initializeNotifications,
  addNotificationResponseListener,
  clearBadge,
  setBadgeCount
} from '../services/pushNotification';
import { notificationApi } from '../api/notificationApi';

interface UseNotificationsOptions {
  onNotificationTap?: (data: any) => void;
}

interface UseNotificationsReturn {
  unreadCount: number;
  isConnected: boolean;
  refreshUnreadCount: () => Promise<void>;
}

export const useNotifications = (options?: UseNotificationsOptions): UseNotificationsReturn => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const appState = useRef(AppState.currentState);
  const responseListener = useRef<any>(null);

  // Fetch unread count from API
  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      const count = res.data?.count || 0;
      setUnreadCount(count);
      await setBadgeCount(count);
    } catch (error) {
      console.error('[Notifications] Error fetching unread count:', error);
    }
  }, []);

  // Initialize WebSocket connection
  const initWebSocket = useCallback(async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (!userDataStr) {
        console.log('[Notifications] No user data, skipping WebSocket connection');
        return;
      }

      const userData = JSON.parse(userDataStr);
      const userId = userData.id;

      if (!userId) {
        console.log('[Notifications] No user ID, skipping WebSocket connection');
        return;
      }

      // Set callback for incoming notifications
      setNotificationCallback((notification) => {
        console.log('[Notifications] Received:', notification);
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        // Update badge
        setBadgeCount(unreadCount + 1);
      });

      // Connect to WebSocket
      const connected = await connectWebSocket(userId);
      setIsConnected(connected);

      if (connected) {
        console.log('[Notifications] WebSocket connected for user:', userId);
      }
    } catch (error) {
      console.error('[Notifications] Error initializing WebSocket:', error);
    }
  }, [unreadCount]);

  // Handle app state changes
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      console.log('[Notifications] App came to foreground');
      refreshUnreadCount();
      
      // Reconnect WebSocket if disconnected
      if (!isWebSocketConnected()) {
        initWebSocket();
      }
    }
    appState.current = nextAppState;
  }, [refreshUnreadCount, initWebSocket]);

  useEffect(() => {
    // Initialize push notifications
    initializeNotifications();

    // Fetch initial unread count
    refreshUnreadCount();

    // Initialize WebSocket
    initWebSocket();

    // Listen for notification taps
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('[Notifications] Notification tapped:', data);
      
      if (options?.onNotificationTap) {
        options.onNotificationTap(data);
      }

      // Clear badge when notification is tapped
      clearBadge();
    });

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Cleanup
      if (responseListener.current) {
        responseListener.current.remove();
      }
      subscription.remove();
      disconnectWebSocket();
    };
  }, []);

  return {
    unreadCount,
    isConnected,
    refreshUnreadCount,
  };
};
