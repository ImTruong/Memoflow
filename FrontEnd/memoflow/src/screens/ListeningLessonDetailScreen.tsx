import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { colors } from '../theme/colors';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { listeningApi, ListeningLessonDetailResponse } from '../api/listeningApi';

const AudioPlayer = ({ url }: { url: string }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const isMountedRef = useRef(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(1);

  useEffect(() => {
    isMountedRef.current = true;

    const setup = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const sound = new Audio.Sound();
        await sound.loadAsync(
          { uri: url },
          { shouldPlay: false, progressUpdateIntervalMillis: 500 },
          false,
        );

        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (!status.isLoaded || !isMountedRef.current) return;
          setPosition(status.positionMillis);
          setDuration(status.durationMillis ?? 0);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
            sound.stopAsync().then(() => sound.setPositionAsync(0)).catch(() => { });
          }
        });

        soundRef.current = sound;
        if (isMountedRef.current) setIsLoading(false);
      } catch (err) {
        console.error('AudioPlayer load error:', err);
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    setup();

    return () => {
      isMountedRef.current = false;
      soundRef.current?.unloadAsync().catch(() => { });
    };
  }, [url]);

  const handlePlayPause = async () => {
    if (!soundRef.current || isLoading) return;
    try {
      isPlaying
        ? await soundRef.current.pauseAsync()
        : await soundRef.current.playAsync();
    } catch (err) {
      console.error('AudioPlayer play/pause error:', err);
    }
  };

  const handleSeek = async (event: any) => {
    if (!soundRef.current || duration <= 0) return;
    const touchX = event.nativeEvent.locationX;
    const newPercent = Math.max(0, Math.min(touchX / progressBarWidth, 1));
    try {
      await soundRef.current.setPositionAsync(newPercent * duration);
      if (isPlaying) await soundRef.current.playAsync();
    } catch (err) {
      console.error('AudioPlayer seek error:', err);
    }
  };

  const formatTime = (millis: number) => {
    const s = Math.floor(millis / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.audioWrapper}>
      <TouchableOpacity
        style={styles.playIconBox}
        onPress={handlePlayPause}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#FFF" />
        )}
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleSeek}
          style={styles.progressBarBg}
          onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
        >
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </TouchableOpacity>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>{formatTime(position)}</Text>
          <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

type ListeningLessonDetailScreenProps = {
  onBack: () => void;
  onNavigateToListeningLessonResult: () => void;
  listeningLessonId: number;
  isResumeListening: boolean;
};

export const ListeningLessonDetailScreen: React.FC<ListeningLessonDetailScreenProps> = ({
  onBack,
  onNavigateToListeningLessonResult,
  listeningLessonId,
  isResumeListening,
}) => {
  const [lessonDetail, setLessonDetail] = useState<ListeningLessonDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, { optionId: number; label: string }>>({});
  const [showQuestionSheet, setShowQuestionSheet] = useState(false);

  const submit = async (
    userAnswers: Record<number, { optionId: number; label: string }>,
    isSubmit: boolean
  ) => {
    const answers = Object.entries(userAnswers).map(([quizId, ans]) => ({
      quizId: Number(quizId),
      optionId: ans.optionId,
    }));

    const payload = {
      lessonId: listeningLessonId,
      answers,
    };

    console.log(answers);

    Alert.alert(
      isSubmit ? 'Xác nhận nộp bài' : 'Tạm lưu bài làm',
      isSubmit
        ? 'Bạn có chắc chắn muốn nộp bài không?'
        : 'Bạn có muốn tạm lưu bài làm không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const res = await listeningApi.submitLesson(payload, isSubmit);
              if (isSubmit) {
                onNavigateToListeningLessonResult();
              } else {
                onBack();
              }
            } catch (err) {
              console.error('Submit error:', err);
              Alert.alert('Không thể gửi dữ liệu, vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await listeningApi.getListeningLessonDetail(listeningLessonId);
        setLessonDetail(res.data);
      } catch (err) {
        console.error('Error fetching lesson detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [listeningLessonId]);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await listeningApi.getLessonSubmission(listeningLessonId);
        const submission = res.data;

        const mappedAnswers: Record<number, { optionId: number; label: string }> = {};

        submission.answers.forEach((ans) => {
          const quiz = lessonDetail?.groups
            .flatMap((g) => g.quizzes)
            .find((q) => q.quizId === ans.quizId);

          if (quiz) {
            const optionIndex = quiz.options.findIndex((opt) => opt.optionId === ans.optionId);
            const label = optionIndex >= 0 ? String.fromCharCode(65 + optionIndex) : '';
            mappedAnswers[ans.quizId] = { optionId: ans.optionId, label };
          }
        });

        setUserAnswers(mappedAnswers);
      } catch (err) {
        console.error('Error fetching submission', err);
      }
    };
    if (isResumeListening) {
      fetchSubmission();
    }
  }, [isResumeListening, listeningLessonId, lessonDetail]);

  const allQuizzes = useMemo(
    () => (lessonDetail ? lessonDetail.groups.flatMap((g) => g.quizzes) : []),
    [lessonDetail]
  );
  const completedCount = Object.keys(userAnswers).length;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!lessonDetail) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Không tải được dữ liệu bài nghe.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={lessonDetail.title} onBack={onBack} titleStyle={styles.headerTitle} />

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {lessonDetail.groups.map((group, gIdx) => (
          <View key={group.groupId} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              {group.audio?.url && <AudioPlayer url={group.audio.url} />}
            </View>

            {group.images?.url && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: group.images.url }} style={styles.quizImage} resizeMode="stretch" />
              </View>
            )}

            {group.quizzes.map((quiz, qIdx) => {
              const globalIndex =
                lessonDetail.groups
                  .slice(0, gIdx)
                  .reduce((sum, g) => sum + g.quizzes.length, 0) +
                qIdx + 1;

              return (
                <View key={quiz.quizId} style={styles.quizBox}>
                  <Text style={styles.questionText}>{globalIndex}. {quiz.questionText}</Text>
                  <View style={styles.optionsContainer}>
                    {quiz.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[quiz.quizId]?.optionId === opt.optionId;
                      const label = String.fromCharCode(65 + oIdx);

                      const handlePress = () => {
                        setUserAnswers(prev => {
                          const current = prev[quiz.quizId];
                          if (current?.optionId === opt.optionId) {
                            const { [quiz.quizId]: _, ...rest } = prev;
                            return rest;
                          }
                          return { ...prev, [quiz.quizId]: { optionId: opt.optionId, label } };
                        });
                      };

                      return (
                        <TouchableOpacity
                          key={opt.optionId}
                          onPress={handlePress}
                          style={[styles.optionItem, isSelected && styles.optionSelected]}
                        >
                          <View style={[styles.optionCircle, isSelected && styles.circleSelected]}>
                            <Text style={[styles.optionLabel, isSelected && styles.textWhite]}>{label}</Text>
                          </View>
                          <Text style={[styles.optionText, isSelected && styles.textSelectedBold]}>{opt.optionText}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnListIcon} onPress={() => setShowQuestionSheet(true)}>
          <View style={styles.iconBadgeContainer}>
            <MaterialCommunityIcons name="format-list-bulleted" size={24} color={colors.primary} />
            <View style={styles.miniDotCount}>
              <Text style={styles.miniDotText}>{completedCount}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDraftAction} onPress={() => submit(userAnswers, false)}>
          <Ionicons name="save-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.btnTextDraftAction}>Tạm lưu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSubmitAction} onPress={() => submit(userAnswers, true)}>
          <Text style={styles.btnTextSubmitAction}>Nộp bài</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showQuestionSheet} transparent statusBarTranslucent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Tiến độ làm bài</Text>
                <Text style={styles.sheetSubtitle}>Đã chọn {completedCount}/{allQuizzes.length} câu</Text>
              </View>
              <TouchableOpacity onPress={() => setShowQuestionSheet(false)}>
                <Ionicons name="close-circle" size={32} color="#E2E8F0" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.gridContainer}>
              {allQuizzes.map((q, index) => {
                const answer = userAnswers[q.quizId];
                return (
                  <View key={q.quizId} style={styles.gridWrapper}>
                    <View style={[styles.gridItem, answer ? styles.gridItemDone : styles.gridItemTodo]}>
                      <Text style={[styles.gridText, answer && styles.textWhite]}>{index + 1}</Text>
                    </View>
                    {answer && (
                      <View style={styles.miniAnswerBadge}>
                        <Text style={styles.miniAnswerText}>{answer.label}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937' },
  scrollBody: { padding: 16 },
  groupCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1.5, borderColor: '#F1F5F9' },
  groupHeader: { marginBottom: 0 },
  badge: { backgroundColor: '#F1F5F9', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1 },

  audioWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  playIconBox: { width: 40, height: 40, backgroundColor: colors.primary, borderRadius: '50%', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  progressContainer: { flex: 1, gap: 6 },
  progressBarBg: { height: 5, backgroundColor: '#E2E8F0', borderRadius: 6, overflow: 'hidden', justifyContent: 'center' },
  progressBarFill: { height: '100%', backgroundColor: colors.primary },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },

  imageContainer: { borderRadius: 16, marginTop: 28 },
  quizImage: { width: '100%', aspectRatio: 1.5, borderRadius: 12 },
  quizBox: { marginTop: 28 },
  questionText: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  optionsContainer: { gap: 12 },
  optionItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: '#F1F5F9', backgroundColor: '#FFF' },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#F0F7FF' },
  optionCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  circleSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionLabel: { fontSize: 13, fontWeight: '800', color: '#94A3B8' },
  optionText: { fontSize: 15, color: '#475569', flex: 1 },
  textSelectedBold: { color: colors.primary, fontWeight: '700' },
  textWhite: { color: '#FFF' },

  footer: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10, paddingBottom: 16 },
  btnListIcon: { width: 50, height: 50, backgroundColor: '#F0F7FF', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D0E4FF' },
  iconBadgeContainer: { position: 'relative' },
  miniDotCount: { position: 'absolute', top: -8, right: -10, backgroundColor: colors.primary, minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFF' },
  miniDotText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  btnDraftAction: { flex: 1, height: 50, backgroundColor: '#FFF', borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.primary },
  btnTextDraftAction: { color: colors.primary, fontWeight: '800', fontSize: 15 },
  btnSubmitAction: { flex: 1.2, height: 50, backgroundColor: colors.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnTextSubmitAction: { color: '#FFF', fontWeight: '800', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  sheetContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  sheetSubtitle: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingBottom: 20 },
  gridWrapper: { alignItems: 'center' },
  gridItem: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F1F5F9' },
  gridItemTodo: { backgroundColor: '#F8FAFC' },
  gridItemDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  gridText: { fontSize: 16, fontWeight: '800', color: '#94A3B8' },
  miniAnswerBadge: { position: 'absolute', bottom: -6, right: -6, backgroundColor: '#FFF', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.primary, elevation: 2 },
  miniAnswerText: { fontSize: 10, fontWeight: '900', color: colors.primary },
  sheetCloseBtn: { marginTop: 20, height: 54, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  sheetCloseBtnText: { color: '#475569', fontWeight: '800', fontSize: 15 }
});