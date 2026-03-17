import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { Notification, notificationsData, readNotificationsData } from '../constants/mockData';
import { ScreenHeader } from '../components/shared/ScreenHeader';

type NotificationItemProps = {
  noti: Notification;
};

const NotificationItem: React.FC<NotificationItemProps> = ({ noti }) => {
  return (
    <View style={[styles.card, noti.isRead && styles.readCard]}>
      <View style={[styles.iconBox, { backgroundColor: noti.bgColor }]}>
        {noti.iconType === 'material' ? (
          <MaterialCommunityIcons name={noti.icon as any} size={24} color={noti.iconColor} />
        ) : (
          <FontAwesome5 name={noti.icon as any} size={20} color={noti.iconColor} />
        )}
      </View>
      <View style={styles.textContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, noti.iconColor !== '#9CA3AF' && { color: noti.iconColor === '#8B5CF6' || noti.iconColor === '#3B82F6' || noti.iconColor === '#10B981' ? colors.textPrimary : noti.iconColor }]}>
            {noti.title}
          </Text>
          <Text style={styles.cardTime}>{noti.time}</Text>
        </View>
        <Text style={styles.cardDesc}>
          {noti.description.split(/("(?:[^"]*)")/).map((part, i) => 
            part.startsWith('"') ? <Text key={i} style={styles.highlightText}>{part}</Text> : part
          )}
        </Text>
        
        {noti.hasAction && (
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>{noti.actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

type NotificationScreenProps = {
  onBack: () => void;
};

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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
        {notificationsData.map((noti) => (
          <NotificationItem key={noti.id} noti={noti} />
        ))}
        <Text style={styles.sectionTitle}>ĐÃ ĐỌC</Text>
        {readNotificationsData.map((noti) => (
          <NotificationItem key={noti.id} noti={noti} />
        ))}
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
    backgroundColor: 'transparent',
    borderColor: '#E5E7EB',
    elevation: 0,
    shadowOpacity: 0,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    ...typography.caption,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  cardDesc: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  highlightText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  actionBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F97316',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  actionText: {
    color: '#F97316',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionTitle: {
    ...typography.caption,
    color: '#6B7280',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
    letterSpacing: 1,
  },
});
