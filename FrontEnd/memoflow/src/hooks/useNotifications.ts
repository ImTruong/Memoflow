import { useCallback, useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationApi, NotificationResponse } from '../api/notificationApi';
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

const DEFAULT_PAGE_SIZE = 20;

export const useNotifications = (options?: { onNotificationTap?: (data: any) => void }) => {
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const appState = useRef(AppState.currentState);
  const responseListener = useRef<any>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      // Handle potential API response variations
      const count = typeof res.data === 'object' && res.data !== null 
        ? (res.data as any).count ?? 0 
        : (res.data as number) ?? 0;
      setUnreadCount(count);
      await setBadgeCount(count);
    } catch (error) {
      console.error('[Notifications] Failed to fetch unread count:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async (page: number = 0, size: number = DEFAULT_PAGE_SIZE) => {
    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications(page, size);
      setItems(res.data.content);
    } catch (error) {
      console.error('[Notifications] Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      const res = await notificationApi.markAsRead(id);
      setItems((prev) => prev.map((item) => (item.id === id ? res.data : item)));
      await fetchUnreadCount();
    } catch (error) {
      console.error('[Notifications] Failed to mark as read:', error);
    }
  }, [fetchUnreadCount]);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationApi.deleteNotification(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      await fetchUnreadCount();
    } catch (error) {
      console.error('[Notifications] Failed to delete notification:', error);
    }
  }, [fetchUnreadCount]);

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
        console.log('[Notifications] Received via WebSocket:', notification);
        // Add new notification to list
        setItems(prev => [notification, ...prev]);
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
      console.log('[Notifications] App came to foreground');
      fetchUnreadCount();
      
      // Reconnect WebSocket if disconnected
      if (!isWebSocketConnected()) {
        initWebSocket();
      }
    }
    appState.current = nextAppState;
  }, [fetchUnreadCount, initWebSocket]);

  useEffect(() => {
    // Initialize push notifications
    initializeNotifications();

    // Fetch initial notifications and count
    fetchNotifications(0, DEFAULT_PAGE_SIZE).catch(console.error);
    fetchUnreadCount().catch(console.error);

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
    items,
    unreadCount,
    isLoading,
    isConnected,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    deleteNotification,
    setItems,
  };
};
