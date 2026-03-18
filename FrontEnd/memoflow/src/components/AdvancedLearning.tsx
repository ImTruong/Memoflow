import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';

type AdvancedItemProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  onPress?: () => void;
  onNavigateToItem: () => void;
};

const AdvancedItem: React.FC<AdvancedItemProps> = ({ title, subtitle, icon, iconBgColor, onPress }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
const AdvancedItem: React.FC<AdvancedItemProps> = ({ title, subtitle, icon, iconBgColor, onNavigateToItem }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onNavigateToItem}>
    <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
      {icon}
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
  </TouchableOpacity>
);
      type AdvancedLearningProps = {
          onNavigateToStoryList?: () => void;
          onNavigateToWordRaceList?: () => void;
          onNavigateToBilingual?: () => void;
      };
export const AdvancedLearning: React.FC<AdvancedLearningProps> = ({
          onNavigateToStoryList,
          onNavigateToWordRaceList,
          onNavigateToBilingual,
      }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Học tập nâng cao</Text>
      
      <View style={styles.listContainer}>
        <AdvancedItem 
          title="Truyện chêm"
          subtitle="Học từ vựng qua các mẩu chuyện"
          icon={<FontAwesome5 name="book-open" size={20} color="#EF4444" />}
          iconBgColor="#FEE2E2" // red-100
          onPress={onNavigateToStoryList}
          onNavigateToItem={() => null}
        />
        <View style={styles.divider} />
        
        <AdvancedItem 
          title="Song ngữ"
          subtitle="Đọc hiểu Anh - Việt mỗi ngày"
          icon={<Ionicons name="newspaper-outline" size={24} color="#3B82F6" />}
          iconBgColor="#DBEAFE" // blue-100
          onNavigateToItem={onNavigateToBilingual}
        />
        <View style={styles.divider} />
        
        <AdvancedItem 
          title="Đua với bot"
          subtitle="Thách đấu điền từ vựng"
          icon={<FontAwesome5 name="robot" size={20} color="#EC4899" />}
          iconBgColor="#FCE7F3" // pink-100
          onPress={onNavigateToWordRaceList}
          onNavigateToItem={() => null}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 80, // padding for the FAB and scroll
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 80, // Offset by icon width + margin
  },
});
