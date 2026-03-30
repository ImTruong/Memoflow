import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Modal
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { mockWordRaceProgress } from '../api/mockWordRaceData';
import { UserLessonProgress } from '../types/story';

const { width, height } = Dimensions.get('window');

interface WordRaceListScreenProps {
  onBack: () => void;
  onNavigateToGame: (progress: UserLessonProgress) => void;
}

export const WordRaceListScreen: React.FC<WordRaceListScreenProps> = ({ onBack, onNavigateToGame }) => {
  const [selectedProgress, setSelectedProgress] = useState<UserLessonProgress | null>(null);
  const [showLevelModal, setShowLevelModal] = useState(false);

  const handleSelectMode = (progress: UserLessonProgress) => {
    setSelectedProgress(progress);
    setShowLevelModal(true);
  };

  const handleStartGame = (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
    if (!selectedProgress) return;

    // Clone and update difficulty
    const updatedProgress = {
      ...selectedProgress,
      learningLesson: {
        ...selectedProgress.learningLesson,
        content: {
          ...selectedProgress.learningLesson.content,
          botDifficulty: difficulty
        }
      }
    };

    setShowLevelModal(false);
    onNavigateToGame(updatedProgress);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nối từ</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner with Scrabble Background */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: "https://static.edupia.vn/uploads/photos/42.%20Game%20ti%E1%BA%BFng%20Anh%205/game%20noi%20tu.png" }} // Placeholder scrabble bg
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Mode List */}
        <View style={styles.listContainer}>
          {mockWordRaceProgress.map((progress, index) => {
            const lesson = progress.learningLesson;
            const content = lesson.content;

            return (
              <TouchableOpacity
                key={progress.id}
                style={styles.modeCard}
                onPress={() => handleSelectMode(progress)}
                activeOpacity={0.9}
              >
                <View style={[styles.idBar, { backgroundColor: content.accentColor || colors.primary }]} />

                <View style={styles.cardContent}>
                  <View style={[styles.iconBox, { backgroundColor: content.bgColor }]}>
                    {/* Using Dynamic Icons based on content config */}
                    <MaterialCommunityIcons
                      name={(content.icon || "play") as any}
                      size={40}
                      color={content.accentColor || colors.primary}
                    />
                  </View>

                  <View style={styles.infoArea}>
                    <Text style={styles.modeTitle}>{lesson.title}</Text>
                    <Text style={styles.modeDesc}>{lesson.description}</Text>

                    <View style={styles.ruleTags}>
                      <View style={styles.tag}>
                        <Ionicons name="trophy-outline" size={14} color="#6B7280" />
                        <Text style={styles.tagText}>{content.targetScore}đ</Text>
                      </View>
                      <View style={styles.tag}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.tagText}>{content.timeLimit}s/Lượt</Text>
                      </View>
                      {content.forbiddenEndings && (
                        <View style={[styles.tag, { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }]}>
                          <Ionicons name="ban-outline" size={14} color="#EF4444" />
                          <Text style={[styles.tagText, { color: '#EF4444' }]}>Không kết thúc bằng {content.forbiddenEndings.join(', ')}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Start Button style as in image: but here we make the card itself clickable */}
                <View style={styles.arrowIcon}>
                  <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Level Selection Modal */}
      <Modal visible={showLevelModal} transparent={true} statusBarTranslucent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLevelModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn cấp độ</Text>
              <TouchableOpacity onPress={() => setShowLevelModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.levelOptions}>
              <TouchableOpacity
                style={[styles.levelBtn, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}
                onPress={() => handleStartGame('EASY')}
              >
                <View style={[styles.levelIcon, { backgroundColor: '#10B981' }]}>
                  <FontAwesome5 name="seedling" size={18} color="#FFF" />
                </View>
                <View>
                  <Text style={[styles.levelName, { color: '#065F46' }]}>Dễ</Text>
                  <Text style={styles.levelDesc}>Bot sử dụng từ ngắn, dễ nối</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.levelBtn, { backgroundColor: '#FFFBEB', borderColor: '#F59E0B' }]}
                onPress={() => handleStartGame('MEDIUM')}
              >
                <View style={[styles.levelIcon, { backgroundColor: '#F59E0B' }]}>
                  <FontAwesome5 name="medal" size={18} color="#FFF" />
                </View>
                <View>
                  <Text style={[styles.levelName, { color: '#92400E' }]}>Trung bình</Text>
                  <Text style={styles.levelDesc}>Thử thách cân não với Bot</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.levelBtn, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}
                onPress={() => handleStartGame('HARD')}
              >
                <View style={[styles.levelIcon, { backgroundColor: '#EF4444' }]}>
                  <FontAwesome5 name="fire" size={18} color="#FFF" />
                </View>
                <View>
                  <Text style={[styles.levelName, { color: '#991B1B' }]}>Khó</Text>
                  <Text style={styles.levelDesc}>Bot cực kỳ thông minh!</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...typography.h2,
    marginBottom: 0,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    height: 180,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  bannerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
    letterSpacing: 4,
    textDecorationLine: 'underline',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  modeCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  idBar: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoArea: {
    flex: 1,
    justifyContent: 'center',
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modeDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  ruleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 4,
  },
  arrowIcon: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(55, 65, 81, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  levelOptions: {
    gap: 16,
  },
  levelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  levelIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  levelDesc: {
    fontSize: 12,
    color: '#6B7280',
  }
});
