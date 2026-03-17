import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Pressable, Animated } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { notificationsData } from '../constants/mockData';

const { height: screenHeight } = Dimensions.get('window');

type NotificationOverlayProps = {
  onClose: () => void;
  onSeeAll: () => void;
};

export const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ onClose, onSeeAll }) => {
  const slideAnim = useRef(new Animated.Value(-20)).current; // Start slightly above
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
          {notificationsData.map((noti) => (
            <View key={noti.id} style={styles.notificationCard}>
              <View style={[styles.iconBox, { backgroundColor: noti.bgColor }]}>
                {noti.iconType === 'material' ? (
                  <MaterialCommunityIcons name={noti.icon as any} size={24} color={noti.iconColor} />
                ) : (
                  <FontAwesome5 name={noti.icon as any} size={20} color={noti.iconColor} />
                )}
              </View>
              <View style={styles.notiTextContent}>
                <View style={styles.notiHeader}>
                  <Text style={styles.notiTitle} numberOfLines={1}>{noti.title}</Text>
                  <View style={[styles.timeBadge, { backgroundColor: noti.bgColor }]}>
                    <Text style={[styles.notiTime, { color: noti.iconColor }]}>{noti.time}</Text>
                  </View>
                </View>
                <Text style={styles.notiDesc} numberOfLines={2}>{noti.description}</Text>
              </View>
            </View>
          ))}
          
          <TouchableOpacity style={styles.seeAllBtn} onPress={() => { handleClose(); onSeeAll(); }}>
            <Text style={styles.seeAllText}>Xem toàn bộ thông báo</Text>
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
    zIndex: 90,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
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
    fontWeight: 'bold',
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 8,
  },
  seeAllText: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
    marginRight: 8,
  },
});
