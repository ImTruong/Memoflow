import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { colors } from '../theme/colors';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { listeningApi, ListeningResultResponse } from '../api/listeningApi';
import * as Progress from 'react-native-progress';

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

type Props = {
  onBack: () => void;
  listeningLessonId: number;
};

export const ListeningLessonResultScreen: React.FC<Props> = ({ onBack, listeningLessonId }) => {
  const [result, setResult] = useState<ListeningResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await listeningApi.getListeningResult(listeningLessonId);
        setResult(res.data);
      } catch (err) {
        console.error('Error fetching result', err);
        Alert.alert('Lỗi', 'Không thể tải kết quả bài làm.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [listeningLessonId]);

  const toggleExpand = (groupId: number) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!result) return null;

  return (
    <View style={styles.container}>
      <ScreenHeader title={result.title} onBack={onBack} titleStyle={styles.headerTitle} />

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>

        <View style={styles.summaryCard}>
          <View style={styles.scoreCircleContainer}>
            <Progress.Circle
              size={120}
              progress={result.score / result.totalQuestion}
              showsText={true}
              formatText={() => (
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreBigText}>{result.score}/{result.totalQuestion}</Text>
                  <Text style={styles.scoreSubText}>Câu đúng</Text>
                </View>
              )}
              color="#10B981"
              unfilledColor="#E5E7EB"
              borderWidth={0}
              thickness={10}
            />
          </View>
        </View>

        {result.groups.map((group, gIdx) => (
          <View key={group.groupId} style={styles.groupCard}>
            {group.audio?.url && <AudioPlayer url={group.audio.url} />}
            <View style={[styles.transContainer, expandedGroups[group.groupId] && styles.transContainerActive]}>
              <TouchableOpacity
                style={styles.expandButton}
                activeOpacity={0.7}
                onPress={() => toggleExpand(group.groupId.valueOf() as number)}
              >
                <View style={styles.expandButtonLeft}>
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={expandedGroups[group.groupId] ? colors.primary : '#64748B'}
                  />
                  <Text style={[
                    styles.expandButtonText,
                    expandedGroups[group.groupId] && { color: colors.primary }
                  ]}>
                    {expandedGroups[group.groupId] ? "Ẩn transcript & bản dịch" : "Hiện transcript & bản dịch"}
                  </Text>
                </View>
                <Ionicons
                  name={expandedGroups[group.groupId] ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={expandedGroups[group.groupId] ? colors.primary : '#94A3B8'}
                />
              </TouchableOpacity>

              {expandedGroups[group.groupId] && (
                <View style={styles.expandedContent}>
                  <View style={styles.transcriptSection}>
                    <View style={styles.labelBadge}>
                      <Text style={styles.transcriptLabel}>TRANSCRIPT</Text>
                    </View>
                    <Text style={styles.transcriptText}>{group.transcript}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.translationSection}>
                    <Text style={styles.translationLabel}>Bản dịch:</Text>
                    <Text style={styles.translationSubText}>{group.translation}</Text>
                  </View>
                </View>
              )}
            </View>

            {group.images?.url && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: group.images.url }} style={styles.quizImage} resizeMode="stretch" />
              </View>
            )}

            {group.quizzes.map((quiz, qIdx) => {
              return (
                <View key={quiz.quizId} style={styles.quizBox}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionText}>{qIdx + 1}. {quiz.questionText}</Text>
                    {quiz.userAnswer == null ? (
                      <View style={[styles.miniStatus, { backgroundColor: '#F3F4F6' }]}>
                        <Text style={{ color: '#6B7280', fontSize: 10, fontWeight: 'bold' }}>CHƯA TRẢ LỜI</Text>
                      </View>
                    ) : quiz.options.find(o => o.optionId === quiz.userAnswer)?.correct ? (
                      <View style={[styles.miniStatus, { backgroundColor: '#ECFDF5' }]}>
                        <Text style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold' }}>ĐÚNG</Text>
                      </View>
                    ) : (
                      <View style={[styles.miniStatus, { backgroundColor: '#FEF2F2' }]}>
                        <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold' }}>SAI</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.optionsContainer}>
                    {quiz.options.map((opt, oIdx) => {
                      const label = String.fromCharCode(65 + oIdx);
                      const isUserSelected = quiz.userAnswer === opt.optionId;
                      const correct = opt.correct;

                      return (
                        <View
                          key={opt.optionId}
                          style={[
                            styles.optionItem,
                            correct && quiz.userAnswer != null && styles.optionCorrect,
                            (isUserSelected && !correct) && styles.optionWrong,
                            quiz.userAnswer == null && correct && styles.optionNoChoice
                          ]}
                        >
                          <View
                            style={[
                              styles.optionCircle,
                              correct && quiz.userAnswer != null && { backgroundColor: '#10B981', borderColor: '#10B981' },
                              (isUserSelected && !correct) && { backgroundColor: '#EF4444', borderColor: '#EF4444' },
                              quiz.userAnswer == null && correct && { backgroundColor: '#9CA3AF', borderColor: '#9CA3AF' }
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionLabel,
                                (correct && quiz.userAnswer != null) ||
                                  (isUserSelected && !correct) ||
                                  (quiz.userAnswer == null && correct)
                                  ? { color: '#FFF' }
                                  : {}
                              ]}
                            >
                              {label}
                            </Text>
                          </View>
                          <Text style={styles.optionText}>{opt.optionText}</Text>
                        </View>
                      );
                    })}
                  </View>

                  {quiz.translation && (
                    <View style={styles.translation}>
                      <Text style={styles.translationLabel}>Bản dịch chi tiết:</Text>
                      <Text style={styles.translationSubText}>{quiz.translation}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937' },
  scrollBody: { padding: 16 },

  summaryCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 24, alignItems: 'center', elevation: 2 },
  scoreCircleContainer: { marginBottom: 0 },
  scoreCircle: { justifyContent: 'center', alignItems: 'center' },
  scoreBigText: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  scoreSubText: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  statsDetailRow: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20 },
  statDetailItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#94A3B8', marginVertical: 4 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1E293B' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  groupCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },

  audioWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  playIconBox: { width: 40, height: 40, backgroundColor: colors.primary, borderRadius: '50%', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  progressContainer: { flex: 1, gap: 6 },
  progressBarBg: { height: 5, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.primary },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  imageContainer: { borderRadius: 16, marginTop: 28 },
  quizImage: { width: '100%', aspectRatio: 1.5, borderRadius: 12 },
  quizBox: { marginTop: 25, borderTopWidth: 0, borderTopColor: '#F1F5F9', paddingTop: 0 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  questionText: { fontSize: 15, fontWeight: '800', color: '#1E293B', flex: 1 },
  miniStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },

  optionsContainer: { gap: 10 },
  optionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  optionCorrect: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  optionWrong: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  optionNoChoice: { backgroundColor: '#F3F4F6', borderColor: '#9CA3AF' },
  optionCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  optionLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8' },
  optionText: { fontSize: 14, color: '#475569', flex: 1 },

  transContainer: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  transContainerActive: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  expandButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 10,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  transcriptSection: {
    marginTop: 4,
  },
  labelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  transcriptLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  transcriptText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 23,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  translation: {
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    padding: 12,
  },
  translationSection: {
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 6,
  },
  translationLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  translationSubText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 23,
    fontStyle: 'italic',
  },
});