import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';

type LearningMethodCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  iconType: 'material' | 'fontAwesome';
  iconColor: string;
  backgroundColor: string;
  onPress: () => void;
};

export const LearningMethodCard: React.FC<LearningMethodCardProps> = ({
  title,
  subtitle,
  icon,
  iconType,
  iconColor,
  backgroundColor,
  onPress,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        {iconType === 'material' ? (
          <MaterialCommunityIcons name={icon as any} size={28} color="#FFF" />
        ) : (
          <FontAwesome5 name={icon as any} size={24} color="#FFF" />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity style={[styles.button, { backgroundColor: iconColor }]} onPress={onPress}>
        <Text style={styles.buttonText}>Bắt đầu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
