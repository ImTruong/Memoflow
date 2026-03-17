import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

type Particle = {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
};

type StudyCompletionOverlayProps = {
  isVisible: boolean;
  onClose: () => void;
  type?: 'win' | 'loss';
};

const FIREWORK_COLORS = ['#FF0000', '#FFD700', '#00FF00', '#00BFFF', '#FF00FF', '#FFFFFF', '#FFA500'];

export const StudyCompletionOverlay: React.FC<StudyCompletionOverlayProps> = ({ isVisible, onClose, type = 'win' }) => {
  const isLoss = type === 'loss';
  const pillAnim = useRef(new Animated.Value(-200)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const particles = useRef<Particle[]>([]).current;

  // Initialize particles once
  if (particles.length === 0) {
    for (let i = 0; i < 40; i++) {
      particles.push({
        id: i,
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(1),
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
      });
    }
  }

  useEffect(() => {
    if (isVisible) {
      // Entry animations
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(pillAnim, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Start fireworks loop - only if not a loss
      const fireworksLoop = () => {
        if (!isVisible || isLoss) return;
        launchFirework();
        setTimeout(fireworksLoop, 600);
      };
      
      const timeout = setTimeout(fireworksLoop, 300);
      return () => clearTimeout(timeout);
    } else {
      pillAnim.setValue(-200);
      overlayOpacity.setValue(0);
    }
  }, [isVisible, isLoss]);

  const launchFirework = () => {
    const startX = Math.random() * (width - 100) + 50;
    const startY = Math.random() * (height - 300) + 100;

    particles.forEach((p, i) => {
      p.x.setValue(startX);
      p.y.setValue(startY);
      p.opacity.setValue(1);
      p.scale.setValue(Math.random() * 0.8 + 0.5);

      const angle = (i / particles.length) * Math.PI * 2 + Math.random();
      const distance = Math.random() * 150 + 50;
      const targetX = startX + Math.cos(angle) * distance;
      const targetY = startY + Math.sin(angle) * distance;

      Animated.parallel([
        Animated.timing(p.x, {
          toValue: targetX,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: targetY + 50, // Slight gravity fall
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.fullOverlay, { opacity: overlayOpacity }]}>
      <BlurView intensity={20} style={StyleSheet.absoluteFill} tint={isLoss ? "light" : "dark"} />
      {isLoss && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(239, 68, 68, 0.4)' }]} />}
      
      {/* Particles */}
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              backgroundColor: p.color,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
              ],
              opacity: p.opacity,
            },
          ]}
        />
      ))}

      {/* Pill Notification */}
      <Animated.View style={[styles.pillContainer, { transform: [{ translateY: pillAnim }] }]}>
        <View style={[styles.pill, isLoss && styles.pillLoss]}>
          <View style={[styles.checkContainer, isLoss && styles.checkContainerLoss]}>
            <MaterialCommunityIcons 
              name={isLoss ? "emoticon-sad-outline" : "check-decagram"} 
              size={32} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.pillTitle}>{isLoss ? "Thất bại rồi... 😢" : "Hoàn tất! 🎉"}</Text>
            <Text style={styles.pillSubtitle}>
              {isLoss ? "Bạn đã hết mạng. Hãy thử lại nhé!" : "Bạn đã học xong tất cả từ."}
            </Text>
          </View>
          <TouchableOpacity style={[styles.closeBtn, isLoss && styles.closeBtnLoss]} onPress={onClose}>
            <Text style={[styles.closeBtnText, isLoss && styles.closeBtnTextLoss]}>Lại lần nữa</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillContainer: {
    width: width * 0.9,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B4B', // Deep indigo
    padding: 16,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pillLoss: {
    backgroundColor: '#7F1D1D', // Deep red
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  checkContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkContainerLoss: {
    backgroundColor: '#EF4444',
  },
  textContainer: {
    flex: 1,
  },
  pillTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pillSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  closeBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  closeBtnLoss: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  closeBtnText: {
    color: '#1E1B4B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeBtnTextLoss: {
    color: '#FFFFFF',
  },
  emojiRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  floatingEmoji: {
    fontSize: 40,
    marginHorizontal: 15,
  }
});
