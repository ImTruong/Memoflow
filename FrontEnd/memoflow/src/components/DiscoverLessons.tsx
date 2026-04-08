import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';

type DiscoverLessonsProps = {
  onNavigateToLearning?: () => void;
  onNavigateToListeningParts?: () => void;
  onNavigateToGrammar?: () => void;
};

export const DiscoverLessons: React.FC<DiscoverLessonsProps> = ({
  onNavigateToLearning,
  onNavigateToGrammar,
  onNavigateToListeningParts
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Khám phá bài học</Text>
      
      {/* Main Topic: Vocabulary */}
      <TouchableOpacity 
        style={styles.mainCard}
        onPress={onNavigateToLearning}
      >
        <View style={styles.mainCardHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CHỦ ĐỀ CHÍNH</Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="tag-outline" size={24} color="#FFF" />
          </View>
        </View>
        
        <Text style={styles.mainCardTitle}>Từ vựng</Text>
        <Text style={styles.mainCardSubtitle}>Ghi nhớ theo đường cong lãng quên</Text>
        
        <View style={styles.tagsContainer}>
          <View style={styles.tag}><Text style={styles.tagText}>Học Flashcard</Text></View>
          <View style={styles.tag}><Text style={styles.tagText}>Game điền từ</Text></View>
          <View style={styles.tag}><Text style={styles.tagText}>......</Text></View>
        </View>
      </TouchableOpacity>

      {/* Sub Topics Row */}
      <View style={styles.subTopicsRow}>
        {/* Grammar Topic */}
        <TouchableOpacity
          style={[styles.subCard, styles.subCardGrammar]}
          onPress={onNavigateToGrammar}
        >
          <View style={[styles.subIconContainer, styles.subIconGrammar]}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>AB</Text>
            <MaterialCommunityIcons name="check" size={12} color="#FFF" style={{ position: 'absolute', bottom: 4, right: 6 }} />
          </View>
          <Text style={styles.subCardTitle}>Ngữ pháp</Text>
          <Text style={styles.subCardSubtitle}>Lý thuyết và Trắc nghiệm</Text>
        </TouchableOpacity>

        {/* Listening Topic */}
        <TouchableOpacity style={[styles.subCard, styles.subCardListening]} onPress={onNavigateToListeningParts}>
          <View style={[styles.subIconContainer, styles.subIconListening]}>
            <FontAwesome5 name="headphones" size={20} color="#FFF" />
          </View>
          <Text style={styles.subCardTitle}>Luyện nghe</Text>
          <Text style={styles.subCardSubtitle}>Đề thi mẫu TOEIC</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  mainCard: {
    backgroundColor: colors.cardBackgrounds.greenLight,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#A7F3D0', // darker green tint
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconContainer: {
    backgroundColor: colors.secondary,
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCardTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  mainCardSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  subTopicsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  subCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
  },
  subCardGrammar: {
    backgroundColor: colors.cardBackgrounds.orangeLight,
  },
  subCardListening: {
    backgroundColor: colors.cardBackgrounds.blueLight,
  },
  subIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  subIconGrammar: {
    backgroundColor: colors.warning,
  },
  subIconListening: {
    backgroundColor: colors.info,
  },
  subCardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subCardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
