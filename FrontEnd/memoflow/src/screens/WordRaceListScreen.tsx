import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { LearningLesson } from '../types/story';
import { wordRaceApi } from '../api/wordRaceApi';
import {
  BotDifficulty,
  WordRaceLesson,
  WordRaceLessonContent,
} from '../types/wordRace';

const FALLBACK_VISUALS = [
  { accentColor: '#0284C7', iconBackground: '#E0F2FE', iconName: 'play-circle' },
  { accentColor: '#0F766E', iconBackground: '#CCFBF1', iconName: 'timer-sand' },
  { accentColor: '#B45309', iconBackground: '#FEF3C7', iconName: 'flash' },
];

const toSafeNumber = (value: unknown, fallback: number): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const inferVisual = (lesson: WordRaceLesson) => {
  const content = (lesson.content || {}) as WordRaceLessonContent;
  const timeLimit = toSafeNumber(content.timeLimit, 12);
  const targetScore = toSafeNumber(content.targetScore, 50);
  const forbiddenEndings = Array.isArray(content.forbiddenEndings)
    ? content.forbiddenEndings
        .map((ending) => ending.trim().toLowerCase())
        .filter((ending) => ending.length > 0)
    : [];

  if (forbiddenEndings.length > 0 && timeLimit <= 7) {
    return {
      accentColor: '#DC2626',
      iconBackground: '#FEE2E2',
      iconName: 'flash',
    };
  }

  if (forbiddenEndings.length > 0) {
    return {
      accentColor: '#BE123C',
      iconBackground: '#FFE4E6',
      iconName: 'close-circle-outline',
    };
  }

  if (timeLimit <= 6) {
    return {
      accentColor: '#B45309',
      iconBackground: '#FEF3C7',
      iconName: 'flash',
    };
  }

  if (timeLimit <= 10) {
    return {
      accentColor: '#0F766E',
      iconBackground: '#CCFBF1',
      iconName: 'timer-sand',
    };
  }

  if (targetScore <= 40) {
    return {
      accentColor: '#0284C7',
      iconBackground: '#E0F2FE',
      iconName: 'play-circle',
    };
  }

  const lessonId = Math.abs(toSafeNumber(lesson.id, 0));
  return FALLBACK_VISUALS[lessonId % FALLBACK_VISUALS.length];
};

interface WordRaceListScreenProps {
  onBack: () => void;
  onNavigateToGame: (lesson: LearningLesson, difficulty: BotDifficulty) => void;
}

export const WordRaceListScreen: React.FC<WordRaceListScreenProps> = ({ onBack, onNavigateToGame }) => {
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson | null>(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [lessons, setLessons] = useState<WordRaceLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLessons = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await wordRaceApi.getWordRaceLessons(0, 50);
      const sorted = [...response.data.content].sort((a, b) => a.id - b.id);

      setLessons(sorted);
    } catch (error) {
      console.error('Failed to load Word Race lessons', error);
      setErrorMessage('Không thể tải danh sách màn chơi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLessons();
  }, [loadLessons]);

  const handleSelectMode = (lesson: LearningLesson) => {
    setSelectedLesson(lesson);
    setShowLevelModal(true);
  };

  const handleStartGame = (difficulty: BotDifficulty) => {
    if (!selectedLesson) return;

    setShowLevelModal(false);
    onNavigateToGame(selectedLesson, difficulty);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đua từ với Bot</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerText}>ĐUA TỪ VỚI BOT</Text>
            <Text style={styles.bannerSubText}>Chọn chế độ và cấp độ để bắt đầu</Text>
          </View>
        </View>

        <View style={styles.lessonCountBadge}>
          <Ionicons name="layers-outline" size={14} color="#4B5563" />
          <Text style={styles.lessonCountText}>Hiện có {lessons.length} màn chơi</Text>
        </View>

        {/* Mode List */}
        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={styles.statusCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.statusText}>Đang tải danh sách màn chơi...</Text>
            </View>
          ) : null}

          {!isLoading && errorMessage ? (
            <View style={styles.statusCard}>
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.statusText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void loadLessons()}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!isLoading && !errorMessage && lessons.length === 0 ? (
            <View style={styles.statusCard}>
              <Ionicons name="sparkles-outline" size={20} color="#6B7280" />
              <Text style={styles.statusText}>Chưa có màn chơi nào được mở.</Text>
            </View>
          ) : null}

          {!isLoading && !errorMessage
            ? lessons.map((lesson) => {
                const content = (lesson.content || {}) as WordRaceLessonContent;
                const visual = inferVisual(lesson);
                const forbiddenEndings = Array.isArray(content.forbiddenEndings)
                  ? content.forbiddenEndings
                  : [];

                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={styles.modeCard}
                    onPress={() => handleSelectMode(lesson)}
                    activeOpacity={0.9}
                  >
                    <View style={[styles.idBar, { backgroundColor: visual.accentColor }]} />

                    <View style={styles.cardContent}>
                      <View style={[styles.iconBox, { backgroundColor: visual.iconBackground }]}>
                        <MaterialCommunityIcons name={visual.iconName as any} size={40} color={visual.accentColor} />
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
                            <Text style={styles.tagText}>{content.timeLimit}s/lượt</Text>
                          </View>
                          {forbiddenEndings.length > 0 ? (
                            <View
                              style={[
                                styles.tag,
                                { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' },
                              ]}
                            >
                              <Ionicons name="ban-outline" size={14} color="#EF4444" />
                              <Text style={[styles.tagText, { color: '#EF4444' }]}>
                                Không kết thúc bằng {forbiddenEndings.join(', ')}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    <View style={styles.arrowIcon}>
                      <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
                    </View>
                  </TouchableOpacity>
                );
              })
            : null}
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
  lessonCountBadge: {
    marginTop: 12,
    marginHorizontal: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  lessonCountText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  bannerContainer: {
    height: 180,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
    letterSpacing: 4,
    textDecorationLine: 'underline',
  },
  bannerSubText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
