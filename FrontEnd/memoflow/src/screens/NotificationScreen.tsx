import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { getNotificationIconConfig } from '../constants/notificationIcons';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationResponse } from '../api/notificationApi';

type NotificationItemProps = {
  noti: NotificationResponse;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s trước`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}p trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
};

const NotificationItem: React.FC<NotificationItemProps> = ({ noti, onMarkRead, onDelete }) => {
  const config = getNotificationIconConfig(noti.type);
  const iconColor = noti.iconColor || config.iconColor;

  return (
    <TouchableOpacity
      style={[styles.card, noti.isRead && styles.readCard]}
      onPress={() => {
        if (!noti.isRead) onMarkRead(noti.id);
      }}
      onLongPress={() => onDelete(noti.id)}
    >
      <View style={[styles.iconBox, { backgroundColor: noti.bgColor || config.bgColor }]}>
        {config.iconFamily === 'Ionicons' ? (
          <Ionicons name={config.iconName as any} size={24} color={iconColor} />
        ) : (
          <FontAwesome5 name={config.iconName as any} size={20} color={iconColor} />
        )}
      </View>
      <View style={styles.textContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, iconColor !== '#9CA3AF' && { color: iconColor === '#8B5CF6' || iconColor === '#3B82F6' || iconColor === '#10B981' ? colors.textPrimary : iconColor }]}>
            {noti.title}
          </Text>
          <Text style={styles.cardTime}>{formatTimeAgo(noti.createdAt)}</Text>
        </View>
        <Text style={styles.cardDesc}>
          {noti.message}
        </Text>
        
        {noti.hasAction && noti.actionText && (
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>{noti.actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

type NotificationScreenProps = {
  onBack: () => void;
};

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const { items, fetchNotifications, markAsRead, deleteNotification } = useNotifications();

  useEffect(() => {
    fetchNotifications(0, 50).catch(console.error);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const unreadItems = items.filter(item => !item.isRead);
  const readItems = items.filter(item => item.isRead);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <ScreenHeader
        title="Thông báo"
        onBack={onBack}
        withTopMargin
        backIconName="chevron-back"
        backIconSize={28}
        filledBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {unreadItems.length > 0 && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mới nhất</Text>
            <View style={styles.badgeCount}>
               <Text style={styles.badgeCountText}>{unreadItems.length}</Text>
            </View>
          </View>
        )}
        
        {unreadItems.map((noti) => (
          <NotificationItem
            key={noti.id}
            noti={noti}
            onMarkRead={(id) => markAsRead(id).catch(console.error)}
            onDelete={(id) => deleteNotification(id).catch(console.error)}
          />
        ))}

        {readItems.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>Đã xem</Text>
            </View>
            {readItems.map((noti) => (
              <NotificationItem
                key={noti.id}
                noti={noti}
                onMarkRead={(id) => markAsRead(id).catch(console.error)}
                onDelete={(id) => deleteNotification(id).catch(console.error)}
              />
            ))}
          </>
        )}

        {items.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyText}>Bạn chưa có thông báo nào</Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  readCard: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F1F5F9',
    elevation: 0,
    shadowOpacity: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginRight: 10,
  },
  badgeCount: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeCountText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16, // Smoother corners
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    ...typography.body1,
    fontWeight: 'bold',
    flex: 1,
  },
  cardTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 8,
    fontWeight: '600',
  },
  cardDesc: {
    ...typography.body2,
    color: '#64748B',
    lineHeight: 20,
  },
  actionBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  actionText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
