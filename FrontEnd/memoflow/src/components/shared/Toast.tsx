import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type ToastProps = {
  message: string;
  visible: boolean;
  onHide: () => void;
  type?: 'success' | 'error' | 'info';
};

export const Toast: React.FC<ToastProps> = ({ message, visible, onHide, type = 'success' }) => {
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: Platform.OS === 'ios' ? 60 : 40,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();

      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getStyle = () => {
    switch (type) {
      case 'success': return { icon: 'checkmark-circle', color: '#10B981', bg: 'rgba(236, 253, 245, 0.95)' };
      case 'error': return { icon: 'alert-circle', color: '#EF4444', bg: 'rgba(254, 242, 242, 0.95)' };
      default: return { icon: 'information-circle', color: '#3B82F6', bg: 'rgba(239, 246, 255, 0.95)' };
    }
  };

  const theme = getStyle();

  const Content = (
    <View style={[styles.pill, { backgroundColor: theme.bg }]}>
      <Ionicons name={theme.icon as any} size={20} color={theme.color} />
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }], opacity }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={20} style={styles.blurWrapper}>
          {Content}
        </BlurView>
      ) : (
        Content
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  blurWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    maxWidth: width * 0.9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 10,
    flexShrink: 1,
  },
});
