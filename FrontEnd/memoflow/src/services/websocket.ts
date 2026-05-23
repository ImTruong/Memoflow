import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../api/apiClient';
import { showLocalNotification } from './pushNotification';

// WebSocket endpoint
const WS_URL = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/notifications';

let stompClient: Client | null = null;
let subscription: StompSubscription | null = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

// Callback for when notification is received
type NotificationCallback = (notification: any) => void;
let onNotificationReceived: NotificationCallback | null = null;

export const setNotificationCallback = (callback: NotificationCallback) => {
  onNotificationReceived = callback;
};

export const connectWebSocket = async (userId: number): Promise<boolean> => {
  if (isConnected && stompClient?.connected) {
    console.log('[WebSocket] Already connected');
    return true;
  }

  return new Promise((resolve) => {
    try {
      const token = AsyncStorage.getItem('accessToken');
      
      stompClient = new Client({
        brokerURL: WS_URL,
        connectHeaders: {},
        debug: (str) => {
          if (__DEV__) {
            console.log('[STOMP]', str);
          }
        },
        reconnectDelay: RECONNECT_DELAY,
        heartbeatIncoming: 25000,
        heartbeatOutgoing: 25000,
        
        onConnect: () => {
          console.log('[WebSocket] Connected successfully');
          isConnected = true;
          reconnectAttempts = 0;
          
          // Subscribe to personal notification queue
          subscription = stompClient?.subscribe('/user/queue/notifications', (message: IMessage) => {
            handleNotificationMessage(message);
          }) || null;
          
          // Register device with the server
          registerDevice(userId);
          
          resolve(true);
        },
        
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected');
          isConnected = false;
        },
        
        onStompError: (frame) => {
          console.error('[WebSocket] STOMP error:', frame.headers['message']);
          isConnected = false;
          handleReconnect(userId);
          resolve(false);
        },
        
        onWebSocketError: (event) => {
          console.error('[WebSocket] WebSocket error:', event);
          isConnected = false;
          resolve(false);
        },
        
        onWebSocketClose: () => {
          console.log('[WebSocket] WebSocket closed');
          isConnected = false;
          handleReconnect(userId);
        },
      });
      
      // For React Native, we need to use SockJS or a WebSocket polyfill
      // Since SockJS is complex in RN, we'll use native WebSocket
      stompClient.webSocketFactory = () => {
        return new WebSocket(WS_URL.replace('/ws/notifications', '/ws/notifications/websocket'));
      };
      
      stompClient.activate();
      
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      resolve(false);
    }
  });
};

const registerDevice = (userId: number) => {
  if (stompClient?.connected) {
    const platform = Platform.OS.toUpperCase(); // 'IOS', 'ANDROID', 'WEB'
    stompClient.publish({
      destination: '/app/register-device',
      body: JSON.stringify({
        userId,
        platform,
      }),
    });
    console.log('[WebSocket] Device registered for user:', userId);
  }
};

const handleNotificationMessage = (message: IMessage) => {
  try {
    const notification = JSON.parse(message.body);
    console.log('[WebSocket] Received notification:', notification);
    
    // Show local push notification
    showLocalNotification(
      notification.title,
      notification.body,
      notification.data
    );
    
    // Trigger callback for UI update
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  } catch (error) {
    console.error('[WebSocket] Error parsing notification:', error);
  }
};

const handleReconnect = (userId: number) => {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    console.log(`[WebSocket] Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
    setTimeout(() => {
      connectWebSocket(userId);
    }, RECONNECT_DELAY * reconnectAttempts);
  } else {
    console.log('[WebSocket] Max reconnect attempts reached');
  }
};

export const disconnectWebSocket = () => {
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
  
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
  
  isConnected = false;
  reconnectAttempts = 0;
  console.log('[WebSocket] Disconnected and cleaned up');
};

export const isWebSocketConnected = (): boolean => {
  return isConnected && stompClient?.connected === true;
};

export const sendMessage = (destination: string, body: any) => {
  if (stompClient?.connected) {
    stompClient.publish({
      destination,
      body: JSON.stringify(body),
    });
  } else {
    console.warn('[WebSocket] Cannot send message: not connected');
  }
};
