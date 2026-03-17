import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';

type FlashcardSetCardProps = {
  title: string;
  wordCount: number;
  dueCount: number;
  totalDue: number;
  author?: string;
  isPrivate?: boolean;
  icon: string;
  imageUrl?: string;
  iconBgColor: string;
  iconColor: string;
  progressBarColor: string;
  progressPercentage: number;
  onPress: () => void;
};

export const FlashcardSetCard: React.FC<FlashcardSetCardProps> = ({
  title,
  wordCount,
  dueCount,
  totalDue,
  author,
  isPrivate,
  icon,
  imageUrl,
  iconBgColor,
  iconColor,
  progressBarColor,
  progressPercentage,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.iconImage} />
          ) : (
            <MaterialCommunityIcons name={icon as any} size={24} color={iconColor} />
          )}
        </View>
        
        {author ? (
          <View style={styles.authorBadge}>
            <Text style={styles.authorText}>Bởi: {author}</Text>
          </View>
        ) : (
          <Ionicons 
            name={isPrivate ? "lock-closed" : "earth"} 
            size={18} 
            color="#9CA3AF" 
            style={styles.statusIcon} 
          />
        )}
      </View>

      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.wordCountBadge}>
          <Text style={styles.wordCountText}>{wordCount} từ</Text>
        </View>
        <View style={styles.dot} />
        <Text style={styles.dueText}>
          {progressPercentage === 100 
            ? 'Đã học tất cả từ đến hạn 🏆' 
            : dueCount === 0 
              ? (progressPercentage > 0 ? 'Hoàn thành hôm nay ✨' : 'Chưa học')
              : `Cần ôn tập: ${dueCount}/${totalDue}`}
        </Text>


      </View>


      <View style={styles.progressContainer}>
        <View style={[styles.progressBackground]} />
        <View style={[styles.progressFill, { width: `${progressPercentage}%`, backgroundColor: progressBarColor }]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  authorBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  authorText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusIcon: {
    marginTop: 4,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  wordCountBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  wordCountText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: 'bold',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 10,
  },
  dueText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressContainer: {
    height: 6,
    width: '100%',
    position: 'relative',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F4F6',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
