import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '../theme/colors';

type DailyGoalProps = {
  percentage: number;
  completedWords: number;
  totalWords: number;
  onPress?: () => void;
};

export const DailyGoal: React.FC<DailyGoalProps> = ({ percentage, completedWords, totalWords, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Mục tiêu hôm nay</Text>
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Đã học {completedWords}/{totalWords} từ vựng</Text>
        <Text style={styles.footerTextRight}>Tiếp tục nào!</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackgrounds.purpleLight,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  percentageBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#D1D5DB', // gray-300
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footerTextRight: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
