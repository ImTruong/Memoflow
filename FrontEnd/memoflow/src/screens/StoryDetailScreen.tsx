import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Dimensions,
  Modal,
  Platform,
  Animated
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors, typography } from '../theme/colors';
import { UserLessonProgress, StoryVocabulary, StoryContent } from '../types/story';
import { fetchVietnameseMeaning } from '../api/wordHuntApi';

const { width, height } = Dimensions.get('window');
const DICTIONARY_ENDPOINT = 'https://api.dictionaryapi.dev/api/v2/entries/en';

type DictionaryInfo = Pick<StoryVocabulary, 'pos' | 'meaning' | 'phonetic' | 'audioUrl'>;

const getWordKey = (word: string) => word.trim().toLowerCase();

const needsLookup = (vocab: StoryVocabulary) => {
  return !vocab.meaning || !vocab.phonetic || !vocab.pos || !vocab.audioUrl;
};

const getMergedVocab = (
  vocab: StoryVocabulary,
  cache: Record<string, DictionaryInfo>
): StoryVocabulary => {
  const key = getWordKey(vocab.word);
  const cached = cache[key];

  if (!cached) {
    return vocab;
  }

  return {
    ...vocab,
    pos: vocab.pos ?? cached.pos,
    meaning: vocab.meaning ?? cached.meaning,
    phonetic: vocab.phonetic ?? cached.phonetic,
    audioUrl: vocab.audioUrl ?? cached.audioUrl,
  };
};

// API ngoai: goi Dictionary API de lay phien am, audio va loai tu.
const fetchDictionaryEntry = async (word: string): Promise<DictionaryInfo | null> => {
  const response = await fetch(`${DICTIONARY_ENDPOINT}/${encodeURIComponent(word)}`);
  if (!response.ok) return null;

  const payload = await response.json();
  const entry = Array.isArray(payload) ? payload[0] : null;
  if (!entry) return null;

  const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || '';
  const audioUrl = entry.phonetics?.find((p: any) => p.audio)?.audio || '';
  const pos = entry.meanings?.[0]?.partOfSpeech || '';

  const info: DictionaryInfo = {};
  if (phonetic) info.phonetic = phonetic;
  if (audioUrl) info.audioUrl = audioUrl;
  if (pos) info.pos = pos;

  return Object.keys(info).length ? info : null;
};

// Ket hop Dictionary API va MyMemory de bo sung thong tin tu vung trong truyen.
const fetchDictionaryInfo = async (word: string): Promise<DictionaryInfo | null> => {
  const normalized = getWordKey(word);
  if (!normalized) return null;

  const [dictionaryInfo, vietnameseMeaning] = await Promise.all([
    fetchDictionaryEntry(normalized),
    fetchVietnameseMeaning(normalized),
  ]);

  const merged: DictionaryInfo = {};
  if (dictionaryInfo?.phonetic) merged.phonetic = dictionaryInfo.phonetic;
  if (dictionaryInfo?.audioUrl) merged.audioUrl = dictionaryInfo.audioUrl;
  if (dictionaryInfo?.pos) merged.pos = dictionaryInfo.pos;

  if (vietnameseMeaning) {
    merged.meaning = vietnameseMeaning;
  }

  return Object.keys(merged).length ? merged : null;
};

interface StoryDetailScreenProps {
  progress: UserLessonProgress;
  onBack: () => void;
  onComplete: () => void;
}

export const StoryDetailScreen: React.FC<StoryDetailScreenProps> = ({ progress, onBack, onComplete }) => {
  const [selectedWord, setSelectedWord] = useState<StoryVocabulary | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFinishedToast, setShowFinishedToast] = useState(false);
  const [dictionaryCache, setDictionaryCache] = useState<Record<string, DictionaryInfo>>({});
  const [loadingWords, setLoadingWords] = useState<Record<string, boolean>>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const lastTap = useRef<number>(0);
  const requestedWordsRef = useRef<Record<string, boolean>>({});
  
  const lesson = progress.learningLesson;
  const content = lesson.content as StoryContent;
  const selectedWordDetails = selectedWord ? getMergedVocab(selectedWord, dictionaryCache) : null;

  const toastOpacity = useRef(new Animated.Value(0)).current;

  const requestDictionaryInfo = async (word: string) => {
    const key = getWordKey(word);
    if (!key || requestedWordsRef.current[key]) {
      return;
    }

    requestedWordsRef.current[key] = true;
    setLoadingWords((prev) => ({ ...prev, [key]: true }));

    try {
      const info = await fetchDictionaryInfo(word);
      if (info) {
        setDictionaryCache((prev) => ({ ...prev, [key]: info }));
      } else {
        requestedWordsRef.current[key] = false;
      }
    } finally {
      setLoadingWords((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handlePlayAudio = async (vocab: StoryVocabulary) => {
    if (!vocab.audioUrl) {
      return;
    }

    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: vocab.audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Audio playback error', error);
    }
  };

  useEffect(() => {
    const preload = async () => {
      const uniqueWords = new Map<string, StoryVocabulary>();

      content.vocabulary.forEach((vocab) => {
        const key = getWordKey(vocab.word);
        if (key && !uniqueWords.has(key)) {
          uniqueWords.set(key, vocab);
        }
      });

      for (const [key, vocab] of uniqueWords.entries()) {
        if (!needsLookup(vocab) || requestedWordsRef.current[key]) {
          continue;
        }
        void requestDictionaryInfo(vocab.word);
      }
    };

    preload();
  }, [content.vocabulary]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const showToast = () => {
    setShowFinishedToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowFinishedToast(false));
  };

  const handleDoubleTap = useCallback((wordStr: string) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
      const vocab = content.vocabulary.find(
        v => v.word.toLowerCase() === wordStr.toLowerCase()
      );
      if (vocab) {
        setSelectedWord(vocab);
        void requestDictionaryInfo(vocab.word);
      }
    } else {
      lastTap.current = now;
    }
  }, [content.vocabulary]);

  const renderContentWithHighlights = (text: string) => {
    const parts = text.split(/(\{.*?\})/g);
    
    return (
      <Text style={styles.contentParagraph}>
        {parts.map((part, index) => {
          if (part.startsWith('{') && part.endsWith('}')) {
            const wordStr = part.substring(1, part.length - 1);
            return (
              <Text 
                key={index}
                style={styles.highlightedWord}
                onPress={() => handleDoubleTap(wordStr)}
              >
                {wordStr}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  const renderVocabItem = (vocab: StoryVocabulary, index: number) => {
    const key = getWordKey(vocab.word);
    const isLoading = !!loadingWords[key];
    const mergedVocab = getMergedVocab(vocab, dictionaryCache);
    const hasPos = !!mergedVocab.pos;
    const hasMeaning = !!mergedVocab.meaning;
    const meaningLine = hasPos || hasMeaning
      ? `${hasPos ? `(${mergedVocab.pos})` : ''}${hasPos && hasMeaning ? ': ' : ''}${hasMeaning ? mergedVocab.meaning : ''}`
      : isLoading ? 'Đang tra nghĩa...' : 'Chạm để tra nghĩa';
    const showHint = !(hasPos || hasMeaning);
    const canPlayAudio = !!mergedVocab.audioUrl;

    return (
      <View key={index} style={styles.vocabItem}>
        <View style={styles.vocabNumber}>
          <Text style={styles.vocabNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.vocabInfo}>
          <View style={styles.vocabHeader}>
            <Text style={styles.vocabWord}>{mergedVocab.word}</Text>
            {showHint ? (
              <Text style={styles.vocabHint}>{meaningLine}</Text>
            ) : (
              <Text style={styles.vocabPos}>{meaningLine}</Text>
            )}
          </View>
          {mergedVocab.phonetic && (
            <Text style={styles.vocabPhonetic}>{mergedVocab.phonetic}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.audioButton, !canPlayAudio && styles.audioButtonDisabled]}
          onPress={() => handlePlayAudio(mergedVocab)}
          disabled={!canPlayAudio}
        >
          <Ionicons
            name="volume-medium-outline"
            size={20}
            color={canPlayAudio ? colors.primary : '#CBD5F5'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
        </View>
        
        {!progress.isCompleted ? (
          <TouchableOpacity 
            onPress={() => setShowCompleteModal(true)} 
            style={styles.completeButton}
          >
            <Ionicons 
              name="checkmark-circle-outline" 
              size={28} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.completeButton}>
            <Ionicons 
              name="checkmark-circle" 
              size={28} 
              color={colors.secondary} 
            />
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Story Info */}
        <View style={styles.storyHeader}>
          <View style={styles.titleArea}>
            <Text style={styles.storyTitle}>{lesson.title}</Text>
            {content.englishTitle && (
              <Text style={styles.storyEnglishTitle}>{content.englishTitle}</Text>
            )}
          </View>
          
          {lesson.image?.url && (
            <Image source={{ uri: lesson.image.url }} style={styles.coverImage} resizeMode="cover" />
          )}
        </View>

        {/* Story Content */}
        <View style={styles.contentArea}>
          {content.paragraphs.map((p, i) => (
            <View key={i} style={styles.paragraphWrapper}>
              {renderContentWithHighlights(p)}
            </View>
          ))}
        </View>

        {/* Vocabulary Section */}
        <View style={styles.vocabSection}>
          <View style={styles.vocabSectionHeader}>
            <View style={styles.vocabSectionTitleWrapper}>
              <View style={styles.vocabIconBg}>
                 <FontAwesome5 name="graduation-cap" size={16} color="#E9B949" />
              </View>
              <Text style={styles.vocabSectionTitle}>Từ vựng trong bài</Text>
            </View>
          </View>
          
          <View style={styles.vocabList}>
            {content.vocabulary.map((v, i) => renderVocabItem(v, i))}
          </View>
        </View>
      </ScrollView>

      {/* Word Detail Modal */}
      <Modal
        visible={!!selectedWord}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setSelectedWord(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.backdropPressable} 
            activeOpacity={1} 
            onPress={() => setSelectedWord(null)}
          />
          <View style={styles.wordDetailCard}>
            <View style={styles.wordDetailHeader}>
              <View>
                <Text style={styles.detailWord}>{selectedWordDetails?.word}</Text>
                {selectedWordDetails?.pos && (
                  <Text style={styles.detailPos}>{selectedWordDetails.pos}</Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.detailAudioBtn, !selectedWordDetails?.audioUrl && styles.audioButtonDisabled]}
                onPress={() => selectedWordDetails && handlePlayAudio(selectedWordDetails)}
                disabled={!selectedWordDetails?.audioUrl}
              >
                <Ionicons name="volume-medium" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailBody}>
              <Text style={styles.detailLabel}>Nghĩa:</Text>
              {selectedWordDetails?.meaning ? (
                <Text style={styles.detailMeaning}>{selectedWordDetails.meaning}</Text>
              ) : (
                <Text style={styles.detailMeaningMuted}>
                  {selectedWordDetails && loadingWords[getWordKey(selectedWordDetails.word)]
                    ? 'Đang tra nghĩa...'
                    : 'Chưa có nghĩa'}
                </Text>
              )}
              
              {selectedWordDetails?.phonetic && (
                <>
                  <Text style={[styles.detailLabel, { marginTop: 12 }]}>Phiên âm:</Text>
                  <Text style={styles.detailPhonetic}>{selectedWordDetails.phonetic}</Text>
                </>
              )}
            </View>

            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setSelectedWord(null)}
            >
              <Text style={styles.closeBtnText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Complete Confirmation Modal */}
      <Modal
        visible={showCompleteModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowCompleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.backdropPressable} 
            activeOpacity={1} 
            onPress={() => setShowCompleteModal(false)}
          />
          <View style={styles.completeModalContent}>
            <View style={styles.completeIconWrapper}>
              <MaterialCommunityIcons name="book-open-page-variant" size={48} color={colors.primary} />
            </View>
            <Text style={styles.completeTitle}>Hoàn thành bài đọc?</Text>
            <Text style={styles.completeSubtitle}>
              Bạn đã đọc và hiểu hết nội dung của câu chuyện này chưa?
            </Text>
            
            <View style={styles.completeActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setShowCompleteModal(false)}
              >
                <Text style={styles.cancelBtnText}>TRỞ LẠI</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={() => {
                  setShowCompleteModal(false);
                  onComplete();
                  showToast();
                }}
              >
                <Text style={styles.confirmBtnText}>XÁC NHẬN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Finished Toast */}
      {showFinishedToast && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
            <Text style={styles.toastText}>🎉 Bài học đã hoàn thành!</Text>
          </View>
        </Animated.View>
      )}
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
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  completeButton: {
    padding: 4,
    width: 36,
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  storyHeader: {
    padding: 20,
  },
  titleArea: {
    marginBottom: 20,
  },
  storyTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  storyEnglishTitle: {
    fontSize: 18,
    color: colors.info,
    fontWeight: '500',
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  contentArea: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  paragraphWrapper: {
    marginBottom: 20,
  },
  contentParagraph: {
    fontSize: 18,
    lineHeight: 30,
    color: '#4B5563',
  },
  highlightedWord: {
    color: colors.info,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  vocabSection: {
    marginTop: 20,
    backgroundColor: '#FAFBFF',
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
  },
  vocabSectionHeader: {
    marginBottom: 20,
  },
  vocabSectionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vocabIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  vocabSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  vocabList: {},
  vocabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
  },
  vocabNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vocabNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.info,
  },
  vocabInfo: {
    flex: 1,
  },
  vocabHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  vocabWord: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.info,
    marginRight: 8,
  },
  vocabPos: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  vocabHint: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  vocabPhonetic: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  audioButton: {
    padding: 8,
  },
  audioButtonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.7)', // Premium Dark/Gray background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  wordDetailCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 30,
    padding: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  wordDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailWord: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
  },
  detailPos: {
    fontSize: 15,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  detailAudioBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
  },
  detailBody: {
    marginBottom: 28,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  detailMeaning: {
    fontSize: 19,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  detailMeaningMuted: {
    fontSize: 17,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  detailPhonetic: {
    fontSize: 17,
    color: colors.textPrimary,
  },
  closeBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  completeModalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 35,
    padding: 32,
    alignItems: 'center',
  },
  completeIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
  },
  completeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 36,
  },
  completeActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: 'center',
  },
  toastContent: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#EBF4FF',
  },
  toastText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 10,
  },
});
