import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { bilingualApi, BilingualResponse } from '../api/bilingualApi';

const { height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type DisplayMode = 'en_vi' | 'vi_en';

const formatDateTime = (createdAt: string) => {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  const dd = `${d.getDate()}`.padStart(2, '0');
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const BilingualDetailScreen: React.FC<{ onBack: () => void; lessonId: number }> = ({
  onBack,
  lessonId,
}) => {
  const [detail, setDetail] = useState<BilingualResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('en_vi');
  const [manualVisibility, setManualVisibility] = useState<Record<number, boolean>>({});
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [dictionaryEntry, setDictionaryEntry] = useState<any | null>(null);
  const [loadingDict, setLoadingDict] = useState(false);
  const [isViewed, setIsViewed] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await bilingualApi.getBilingualDetail(lessonId);
        if (res.data) setDetail(res.data);
      } catch (err) {
        console.error("Lỗi lấy chi tiết:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [lessonId]);

  const handleMarkAsRead = async () => {
    if (isViewed) return;
    try {
      await bilingualApi.updateViewStatus(lessonId);
      setIsViewed(true);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái đã xem:", err);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
    if (isCloseToBottom) handleMarkAsRead();
  };

  const fetchDictionaryEntry = async (word: string) => {
    try {
      setLoadingDict(true);
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        setDictionaryEntry({
          word: entry.word,
          phonetic: entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || '',
          audio: entry.phonetics?.find((p: any) => p.audio !== '')?.audio ?? '',
          partOfSpeech: entry.meanings[0]?.partOfSpeech ?? '',
          meaning: entry.meanings[0]?.definitions[0]?.definition ?? '',
          exampleEn: entry.meanings[0]?.definitions[0]?.example ?? '',
        });
      } else {
        setDictionaryEntry(null);
      }
    } catch (err) {
      setDictionaryEntry(null);
    } finally {
      setLoadingDict(false);
    }
  };

  const handleWordPress = (rawWord: string) => {
    const cleaned = rawWord.replace(/[.,!?;:()"]/g, '');
    if (cleaned.length > 0) {
      setSelectedWord(cleaned);
      fetchDictionaryEntry(cleaned);
    }
  };

  const renderClickableText = (text: string, isEnglish: boolean, isMain: boolean) => {
    const style = isMain
      ? (isEnglish ? styles.paragraphEn : styles.paragraphVi)
      : styles.translationText;

    if (!isEnglish) return <Text style={style}>{text}</Text>;

    const words = text.split(' ');
    return (
      <Text style={style}>
        {words.map((word, index) => (
          <Text
            key={index}
            style={[
              styles.wordItem,
              selectedWord === word.replace(/[.,!?;:()"]/g, '') && styles.wordSelected,
            ]}
            onPress={() => handleWordPress(word)}
          >
            {word}{index !== words.length - 1 ? ' ' : ''}
          </Text>
        ))}
      </Text>
    );
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color="#3B82F6" size="large" />
      <Text style={{ marginTop: 12, color: '#64748B' }}>Đang tải bài học...</Text>
    </View>
  );

  if (!detail) return null;

  return (
    <View style={styles.mainContainer}>
      <ScreenHeader title={detail?.title || "Nội dung bài đọc"} onBack={onBack} titleStyle={styles.headerTitle} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {detail.media?.url && (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: detail.media.url }} style={styles.coverImage} />
            <View style={styles.imageOverlay} />
          </View>
        )}

        <View style={styles.contentWrapper}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{detail.title}</Text>
            <Text style={styles.description}>{detail.description}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="eye-outline" size={16} color="#94A3B8" />
                <Text style={styles.metaText}>{detail.content.views} views</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={15} color="#94A3B8" />
                <Text style={styles.metaText}>{formatDateTime(detail.content.createdAt)}</Text>
              </View>
            </View>

          </View>

          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeTab, displayMode === 'en_vi' && styles.modeTabActive]}
              onPress={() => { setDisplayMode('en_vi'); setManualVisibility({}); }}
            >
              <Text style={[styles.modeTabText, displayMode === 'en_vi' && styles.modeTabTextActive]}>Anh - Việt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, displayMode === 'vi_en' && styles.modeTabActive]}
              onPress={() => { setDisplayMode('vi_en'); setManualVisibility({}); }}
            >
              <Text style={[styles.modeTabText, displayMode === 'vi_en' && styles.modeTabTextActive]}>Việt - Anh</Text>
            </TouchableOpacity>
          </View>

          {detail.content.paragraphs.map((p) => {
            const isTranslationVisible = manualVisibility[p.order];
            return (
              <View key={p.order} style={styles.paragraphCard}>
                <View style={styles.textContainer}>
                  {renderClickableText(displayMode === 'en_vi' ? p.en : p.vi, displayMode === 'en_vi', true)}
                </View>

                <TouchableOpacity
                  style={[styles.eyeButton, isTranslationVisible && styles.eyeButtonActive]}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setManualVisibility(prev => ({ ...prev, [p.order]: !prev[p.order] }));
                  }}
                >
                  <MaterialCommunityIcons
                    name={isTranslationVisible ? "eye-off-outline" : "translate"}
                    size={18}
                    color={isTranslationVisible ? "#EF4444" : "#3B82F6"}
                  />
                  <Text style={[styles.eyeButtonText, isTranslationVisible && styles.eyeButtonTextActive]}>
                    {isTranslationVisible ? "Ẩn bản dịch" : "Xem bản dịch"}
                  </Text>
                </TouchableOpacity>

                {isTranslationVisible && (
                  <View style={styles.translationBox}>
                    {renderClickableText(displayMode === 'en_vi' ? p.vi : p.en, displayMode === 'vi_en', false)}
                  </View>
                )}
              </View>
            );
          })}

          {isViewed && (
            <View style={styles.finishBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.finishText}>Bạn đã hoàn thành bài học này!</Text>
            </View>
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
      <Modal
        visible={!!selectedWord}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedWord(null)}
      >
        <TouchableOpacity
          style={styles.dictOverlay}
          activeOpacity={1}
          onPress={() => setSelectedWord(null)}
        >
          <View style={styles.dictCard} onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedWord(null)}
            >
              <Ionicons name="close-circle" size={30} color="#CBD5E1" />
            </TouchableOpacity>

            {loadingDict ? (
              <View style={styles.dictLoading}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : dictionaryEntry ? (
              <>
                <View style={styles.dictHeader}>
                  <View style={{ flex: 1, paddingRight: 20 }}>
                    <Text style={styles.dictWord}>{dictionaryEntry.word}</Text>
                    <View style={styles.dictSubHeader}>
                      <View style={styles.posBadge}>
                        <Text style={styles.posBadgeText}>{dictionaryEntry.partOfSpeech}</Text>
                      </View>
                      <Text style={styles.dictPhonetic}>{dictionaryEntry.phonetic}</Text>
                    </View>
                  </View>

                  {dictionaryEntry.audio ? (
                    <TouchableOpacity
                      style={styles.audioCircle}
                      onPress={async () => {
                        try {
                          const { sound } = await Audio.Sound.createAsync({ uri: dictionaryEntry.audio });
                          await sound.playAsync();
                        } catch (err) { console.log(err); }
                      }}
                    >
                      <Ionicons name="volume-high" size={24} color="#FFF" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.dictDivider} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                  <Text style={styles.sectionLabel}>DEFINITION</Text>
                  <Text style={styles.dictMeaning}>{dictionaryEntry.meaning}</Text>

                  {dictionaryEntry.exampleEn ? (
                    <>
                      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>EXAMPLE</Text>
                      <View style={styles.exampleContainer}>
                        <Text style={styles.exampleText}>"{dictionaryEntry.exampleEn}"</Text>
                      </View>
                    </>
                  ) : null}
                </ScrollView>
              </>
            ) : (
              <View style={styles.dictEmpty}>
                <MaterialCommunityIcons name="book-search-outline" size={60} color="#E2E8F0" />
                <Text style={styles.dictEmptyText}>Không tìm thấy dữ liệu cho từ này</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  imageWrapper: { width: '100%', height: 240, overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.05)' },

  contentWrapper: {
    paddingHorizontal: 20,
    marginTop: -30,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24
  },
  categoryTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  categoryText: { color: '#3B82F6', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', lineHeight: 32 },
  description: { fontSize: 17, color: '#64748B', marginTop: 12, lineHeight: 22, fontStyle: 'italic' },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 13, color: '#94A3B8', marginLeft: 6, fontWeight: '600' },
  metaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 12 },

  modeContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 16, padding: 4, marginBottom: 20 },
  modeTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  modeTabActive: { backgroundColor: '#FFF', elevation: 3, shadowOpacity: 0.1, shadowRadius: 4 },
  modeTabText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  modeTabTextActive: { color: '#3B82F6' },

  paragraphCard: {
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  textContainer: { marginBottom: 4 },
  paragraphEn: { fontSize: 18, color: '#1E293B', lineHeight: 28 },
  paragraphVi: { fontSize: 18, color: '#1E293B', lineHeight: 28 },
  wordItem: { color: '#1E293B' },
  wordSelected: { backgroundColor: '#DBEAFE', color: '#1D4ED8', borderRadius: 4, fontWeight: '700' },

  eyeButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },
  eyeButtonActive: { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' },
  eyeButtonText: { fontSize: 12, color: '#64748B', fontWeight: '800', marginLeft: 6 },
  eyeButtonTextActive: { color: '#EF4444' },

  translationBox: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  translationText: { fontSize: 16, color: '#64748B', lineHeight: 26, fontStyle: 'italic' },

  finishBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#DCFCE7', padding: 16, borderRadius: 20, marginTop: 10 },
  finishText: { color: '#166534', fontWeight: '800', marginLeft: 10 },

  dictOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  dictCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 30,
    height: height * 0.52,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5
  },
  dictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10
  },
  dictWord: { fontSize: 30, fontWeight: '800', color: '#0F172A' },
  dictSubHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  posBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10 },
  posBadgeText: { fontSize: 11, fontWeight: '900', color: '#64748B', textTransform: 'uppercase' },
  dictPhonetic: { fontSize: 16, color: '#94A3B8', fontWeight: '500' },
  audioCircle: {
    width: 40,
    height: 40,
    borderRadius: 23,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 }
  }, dictDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.2, marginBottom: 8 },
  dictMeaning: { fontSize: 17, color: '#334155', lineHeight: 26 },
  exampleContainer: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#3B82F6', marginTop: 5 },
  exampleText: { fontSize: 15, color: '#64748B', fontStyle: 'italic', lineHeight: 22 },
  dictEmpty: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingBottom: 40 },
  dictEmptyText: { marginTop: 16, color: '#94A3B8', fontSize: 15, textAlign: 'center' },
  dictLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  headerInfo: {
    paddingVertical: 16,
    marginBottom: 8
  },
});