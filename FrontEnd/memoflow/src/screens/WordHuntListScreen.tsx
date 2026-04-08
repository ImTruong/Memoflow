import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { WordHuntProgress } from '../types/wordHunt';

type WordHuntListScreenProps = {
  progresses: WordHuntProgress[];
  onBack: () => void;
  onNavigateToGame: (progress: WordHuntProgress) => void;
};

const isUnlocked = (allProgresses: WordHuntProgress[], index: number): boolean => {
  if (index === 0) return true;
  return allProgresses[index - 1]?.isCompleted === true;
};

export const WordHuntListScreen: React.FC<WordHuntListScreenProps> = ({
  progresses,
  onBack,
  onNavigateToGame,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [lockedLesson, setLockedLesson] = useState<WordHuntProgress | null>(null);

  const filtered = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return progresses;

    return progresses.filter((item) => item.learningLesson.title.toLowerCase().includes(keyword));
  }, [progresses, searchValue]);

  const firstUnlockedIncompleteId = useMemo(() => {
    for (let i = 0; i < progresses.length; i += 1) {
      if (isUnlocked(progresses, i) && !progresses[i].isCompleted) {
        return progresses[i].id;
      }
    }

    return -1;
  }, [progresses]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tinh mắt tìm từ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#F97316" />
        <TextInput
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Tìm chủ đề..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardGrid}>
          {filtered.map((progress) => {
            const index = progresses.findIndex((item) => item.id === progress.id);
            const unlocked = index >= 0 ? isUnlocked(progresses, index) : false;
            const isCompleted = progress.isCompleted;
            const isCurrent = firstUnlockedIncompleteId === progress.id;
            const content = progress.learningLesson.content;

            const cardColor = isCompleted
              ? '#F0FDF4'
              : unlocked
                ? '#FFFFFF'
                : '#F8FAFC';

            const iconBackground = isCompleted
              ? '#DCFCE7'
              : isCurrent && unlocked
                ? '#FFF1E7'
                : unlocked
                  ? '#EEF2FF'
                  : '#E2E8F0';

            const iconColor = isCompleted
              ? '#16A34A'
              : isCurrent && unlocked
                ? '#F97316'
                : unlocked
                  ? '#3B82F6'
                  : '#94A3B8';

            const cardIcon = !unlocked
              ? 'lock-outline'
              : isCompleted
                ? 'check-decagram'
                : isCurrent
                  ? 'play-circle'
                  : 'magnify';
            const showActiveBadge = isCurrent && unlocked && !isCompleted;

            return (
              <TouchableOpacity
                key={progress.id}
                style={[
                  styles.card,
                  { backgroundColor: cardColor },
                  unlocked && isCurrent && styles.activeCard,
                  !unlocked && styles.lockedCard,
                ]}
                activeOpacity={0.9}
                onPress={() => {
                  if (!unlocked) {
                    setLockedLesson(progress);
                    return;
                  }

                  onNavigateToGame(progress);
                }}
              >
                {showActiveBadge && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ĐANG CHƠI</Text>
                  </View>
                )}

                <View style={[
                  styles.iconArea,
                  showActiveBadge && styles.iconAreaWithBadge,
                  {
                    backgroundColor: iconBackground,
                  },
                ]}>
                  <MaterialCommunityIcons
                    name={cardIcon as any}
                    size={34}
                    color={iconColor}
                  />
                </View>

                <Text style={[styles.title, !unlocked && styles.lockedText]} numberOfLines={1}>
                  {progress.learningLesson.title}
                </Text>

                {isCompleted && (
                  <View style={styles.completedRow}>
                    <Ionicons name="checkmark-circle-outline" size={12} color="#16A34A" />
                    <Text style={styles.completedText}>Đã vượt qua</Text>
                  </View>
                )}

                {!isCompleted && unlocked && (
                  <>
                    <Text style={styles.pendingText}>Chưa hoàn thành</Text>
                    <Text style={styles.objectiveText}>{content.objectiveText}</Text>
                  </>
                )}

                {!unlocked && (
                  <Text style={styles.lockReasonText} numberOfLines={2}>
                    {content.unlockRequirementText || 'Cần hoàn thành chủ đề trước để mở khóa'}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal transparent visible={!!lockedLesson} animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="lock-closed-outline" size={24} color="#F97316" />
            </View>

            <Text style={styles.modalTitle}>Chủ đề đang khóa</Text>
            <Text style={styles.modalBody}>
              Bạn cần hoàn thành chủ đề trước đó để có thể trải nghiệm nội dung này. Hãy tiếp tục cố gắng nhé!
            </Text>

            <TouchableOpacity style={styles.modalButton} onPress={() => setLockedLesson(null)}>
              <Text style={styles.modalButtonText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#111827',
  },
  headerSpacer: {
    width: 28,
  },
  searchBox: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 28,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    width: '48.2%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    minHeight: 176,
    position: 'relative',
  },
  activeCard: {
    borderColor: '#F97316',
    borderWidth: 2,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  lockedCard: {
    opacity: 0.92,
  },
  activeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 3,
    borderRadius: 12,
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  iconArea: {
    height: 92,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconAreaWithBadge: {
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  lockedText: {
    color: '#94A3B8',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  completedText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
  },
  pendingText: {
    fontSize: 11,
    color: '#64748B',
  },
  objectiveText: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '700',
  },
  lockReasonText: {
    marginTop: 2,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.28)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFF1E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    ...typography.h3,
    color: '#111827',
    marginBottom: 8,
  },
  modalBody: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalButton: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#F97316',
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
