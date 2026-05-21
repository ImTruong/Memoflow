import { useCallback, useEffect, useState, useRef } from 'react';
import { notificationApi, NotificationResponse } from '../api/notificationApi';

const DEFAULT_PAGE_SIZE = 20;
const WS_URL = 'http://192.168.1.171:8080/ws/notifications'; // Change to your backend URL

export const useNotifications = () => {
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadCount(res.data);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async (page: number = 0, size: number = DEFAULT_PAGE_SIZE) => {
    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications(page, size);
      setItems(res.data.content);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
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
      console.error('Failed to mark as read:', error);
    }
  }, [fetchUnreadCount]);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationApi.deleteNotification(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      await fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [fetchUnreadCount]);

  // TODO: Implement STOMP WebSocket connection later
  // Current backend uses STOMP with SockJS, not plain WebSocket  
  const connectWebSocket = useCallback(() => {
    console.log('⚠️ WebSocket disabled - backend uses STOMP, will implement later');
    return;
  }, []);

  // Setup WebSocket on mount
  useEffect(() => {
    fetchUnreadCount().catch(console.error);
    connectWebSocket();

    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    items,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    deleteNotification,
    setItems,
  };
};

