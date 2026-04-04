import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { grammarApi } from '../api/grammarApi';
import { GrammarTopicDetailResponse } from '../types/grammar';

export const GrammarTopicDetailScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { topicId } = route.params;
  const [topic, setTopic] = useState<GrammarTopicDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await grammarApi.getTopicDetail(topicId);
        setTopic(res.data);
      } catch (err: any) {
        setError(err?.message || 'Không thể tải chủ điểm lý thuyết.');
      } finally {
        setLoading(false);
      }
    };

    if (topicId) load();
  }, [topicId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#E67E22" />
      </SafeAreaView>
    );
  }

  if (error || !topic) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error || 'Không có dữ liệu.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{topic.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
           <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Tiến độ chung</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{topic.progressLabel}</Text>
              </View>
           </View>
           <View style={styles.progressBar}>
              <View style={[styles.progressInner, { width: `${topic.progressPercent}%` }]} />
           </View>
        </View>

        {topic.subLessons.map((lesson) => (
          <TouchableOpacity 
            key={lesson.id} 
            style={[styles.lessonCard, lesson.status === 'Đã xong' && styles.lessonDone, lesson.status === 'Đang học' && styles.lessonStudying]}
            onPress={() => navigation.navigate('LessonContentView', { lessonId: lesson.id })}
          >
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonSubTitle}>{lesson.subTitle}</Text>
            </View>
            <View style={[styles.statusBadge, lesson.status === 'Đã xong' && styles.statusBadgeDone, lesson.status === 'Đang học' && styles.statusBadgeStudying]}>
              <Text style={[styles.statusBadgeText, lesson.status === 'Đã xong' && styles.statusBadgeTextDone, lesson.status === 'Đang học' && styles.statusBadgeTextStudying]}>
                {lesson.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginLeft: 10 },
  content: { padding: 20 },
  progressContainer: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, color: '#D97706', fontWeight: 'bold' },
  progressBar: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressInner: { height: '100%', backgroundColor: '#E67E22' },
  lessonCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderLeftWidth: 4, borderLeftColor: '#E2E8F0', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  lessonDone: { borderLeftColor: '#10B981', backgroundColor: '#F0FDF4' },
  lessonStudying: { borderLeftColor: '#F59E0B', backgroundColor: '#FFFBEB' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 17, fontWeight: 'bold', color: '#0F172A' },
  lessonSubTitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  statusBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeDone: { backgroundColor: '#D1FAE5' },
  statusBadgeStudying: { backgroundColor: '#FEF3C7' },
  statusBadgeText: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  statusBadgeTextDone: { color: '#059669' },
  statusBadgeTextStudying: { color: '#D97706' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center' },
});
