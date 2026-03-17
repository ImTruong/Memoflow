import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type ScreenTransitionProps = {
  children: React.ReactNode;
  trigger: any;
};

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, trigger }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Reset
    fadeAnim.setValue(0);
    slideAnim.setValue(10);

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [trigger]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
