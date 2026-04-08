import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Pressable, Animated } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../theme/colors';
import { getNotificationIconConfig } from '../constants/notificationIcons';
import { useNotifications } from '../hooks/useNotifications';

const { height: screenHeight } = Dimensions.get('window');

type NotificationOverlayProps = {
  onClose: () => void;
  onSeeAll: () => void;
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

const NotificationIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 20 }) => {
  const config = getNotificationIconConfig(type);
  
  const renderIcon = () => {
    if (config.iconFamily === 'Ionicons') {
      return <Ionicons name={config.iconName as any} size={size} color={config.iconColor} />;
    }
    return <FontAwesome5 name={config.iconName as any} size={size - 2} color={config.iconColor} />;
  };
  
  if (config.hasGradient && config.gradientColors) {
    return (
      <LinearGradient
        colors={config.gradientColors as any}
        style={styles.iconBox}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <FontAwesome5 name={config.iconName as any} size={size - 2} color="#FFFFFF" />
      </LinearGradient>
    );
  }
  
  return (
    <View style={[styles.iconBox, { backgroundColor: config.bgColor }]}>
      {renderIcon()}
    </View>
  );
};

export const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ onClose, onSeeAll }) => {
  const slideAnim = useRef(new Animated.Value(-20)).current; // Start slightly above
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const { items, fetchNotifications, markAsRead } = useNotifications();

  useEffect(() => {
    fetchNotifications(0, 5).catch(console.error);

    // Entrance animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    // Exit animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.backdrop, 
          { opacity: backdropOpacity }
        ]} 
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView 
          style={styles.notificationList} 
          contentContainerStyle={styles.notificationListContent} 
          showsVerticalScrollIndicator={false}
        >
          {items.map((noti) => {
             const config = getNotificationIconConfig(noti.type);
             const bgColor = noti.bgColor || config.bgColor;
             const iconColor = noti.iconColor || config.iconColor;
 
             return (
              <TouchableOpacity
                key={noti.id}
                style={[
                  styles.notificationCard,
                  noti.isRead && styles.readNotificationCard
                ]}
                onPress={() => {
                  // Navigate to all notifications without marking as read immediately
                  handleClose();
                  onSeeAll();
                }}
              >
                 <NotificationIcon type={noti.type} />
                 <View style={styles.notiTextContent}>
                   <View style={styles.notiHeader}>
                     <Text style={[
                       styles.notiTitle, 
                       { color: config.hasGradient ? colors.primary : iconColor },
                       noti.isRead && styles.readText
                     ]} numberOfLines={1}>
                       {noti.title}
                     </Text>
                     <View style={[styles.timeBadge, { backgroundColor: bgColor }]}> 
                       <Text style={[
                         styles.notiTime, 
                         { color: iconColor },
                         noti.isRead && styles.readText
                       ]}>{formatTimeAgo(noti.createdAt)}</Text>
                     </View>
                   </View>
                   <Text style={[
                     styles.notiDesc,
                     noti.isRead && styles.readText
                   ]} numberOfLines={2}>{noti.message}</Text>
                 </View>
               </TouchableOpacity>
             );
           })}
          
          <TouchableOpacity style={styles.seeAllBtn} onPress={() => { handleClose(); onSeeAll(); }}>
            <Text style={styles.seeAllText}>Xem tất cả thông báo</Text>
            <MaterialCommunityIcons name="arrow-right-thin" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 101, // Keep it above header components
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)', // Lighter backdrop for cleaner look
  },
  content: {
    paddingTop: 0,
  },
  notificationList: {
    maxHeight: screenHeight * 0.7,
  },
  notificationListContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  notificationCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notiTextContent: {
    flex: 1,
  },
  notiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notiTitle: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: 'bold',
    flex: 1,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notiTime: {
    fontSize: 10,
    fontWeight: '800',
  },
  notiDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  seeAllBtn: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  seeAllText: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '700',
    marginRight: 8,
  },
  readNotificationCard: {
    backgroundColor: '#F9FAFB', // Subtle background instead of heavy opacity
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowOpacity: 0.01,
  },
  readText: {
    opacity: 0.8,
  },
});
