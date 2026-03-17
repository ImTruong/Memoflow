import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';

/**
 * Centered loading spinner – replaces repeated ActivityIndicator in loading states.
 */
export const CenteredLoader: React.FC<{ size?: 'small' | 'large'; color?: string }> = ({
  size = 'large',
  color = '#5B62E3',
}) => (
  <View style={styles.center}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

/**
 * Centered empty state with a message.
 */
export const CenteredEmptyState: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.center}>
    <Text style={styles.message}>{message}</Text>
  </View>
);

/**
 * Centered error state with an optional retry button.
 */
export const CenteredErrorState: React.FC<{
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
}> = ({ message, actionLabel, onActionPress }) => (
  <View style={styles.center}>
    <Text style={styles.message}>{message}</Text>
    {actionLabel && onActionPress && (
      <TouchableOpacity style={styles.retryBtn} onPress={onActionPress}>
        <Text style={styles.retryText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  message: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 14,
  },
});
