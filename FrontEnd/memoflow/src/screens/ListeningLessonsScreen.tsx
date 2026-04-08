import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { listeningApi, ListeningLessonResponse } from '../api/listeningApi';

type FilterType = 'all' | 'completed' | 'in-progress' | 'not-started';

type ListeningLessonsScreenProps = {
  onBack: () => void;
  onNavigateToListeningLessonDetail: (lessonId: number, isResumeListening: boolean) => void;
  onNavigateToListeningLessonResult: (lessonId: number) => void;
  listeningPart: number
};

export const ListeningLessonsScreen: React.FC<ListeningLessonsScreenProps> = ({
  onBack,
  onNavigateToListeningLessonDetail,
  onNavigateToListeningLessonResult,
  listeningPart
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [lessons, setLessons] = useState<ListeningLessonResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchLessons = async (pageNum: number, append = false) => {
    const statusParam = filter === 'all' ? undefined : filter;
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await listeningApi.getListeningLessons(listeningPart, statusParam, pageNum, 10);
      if (res.data?.content) {
        setLessons(prev => append ? [...prev, ...res.data.content] : res.data.content);
        setHasMore(!res.data.last);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchLessons(0);
  }, [filter, listeningPart]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLessons(nextPage, true);
    }
  };

  const renderItem = ({ item }: { item: ListeningLessonResponse }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.infoSection}>
            <Text style={styles.lessonTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Part {listeningPart}</Text>
            </View>
          </View>

          <View style={[
            styles.statusLabel,
            item.isCompleted ? styles.statusDone : item.isCompleted === false ? styles.statusProgress : styles.statusTodo
          ]}>
            <Text style={[
              styles.statusLabelText,
              item.isCompleted ? styles.textDone : item.isCompleted === false ? styles.textProgress : styles.textTodo
            ]}>
              {item.isCompleted
                ? `Hoàn thành (${item.score}/${item.totalQuestions})`
                : item.isCompleted === false
                  ? `Đang làm (${item.score}/${item.totalQuestions})`
                  : 'Chưa làm'}
            </Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          {item.isCompleted ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => onNavigateToListeningLessonResult(item.id)}>
                <Text style={styles.btnTextSecondary}>Kết quả</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimaryOutline} onPress={() => onNavigateToListeningLessonDetail(item.id, false)}>
                <Text style={styles.btnTextPrimary}>Làm lại</Text>
              </TouchableOpacity>
            </View>
          ) : item.isCompleted === false ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => onNavigateToListeningLessonDetail(item.id, true)}>
                <Text style={styles.btnTextWhite}>Tiếp tục</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimaryOutline} onPress={() => onNavigateToListeningLessonDetail(item.id, false)}>
                <Text style={styles.btnTextPrimary}>Làm lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.btnPrimary} onPress={() => onNavigateToListeningLessonDetail(item.id, false)}>
              <Text style={styles.btnTextWhite}>Bắt đầu</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`Part ${listeningPart}`}
        onBack={onBack}
        titleStyle={styles.headerTitle}
      />

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {(['all', 'completed', 'in-progress', 'not-started'] as FilterType[]).map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              style={[styles.filterItem, filter === type && styles.filterItemActive]}
            >
              <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
                {type === 'all' ? 'Tất cả' : type === 'completed' ? 'Hoàn thành' : type === 'in-progress' ? 'Đang làm' : 'Chưa làm'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4F46E5" />
      ) : (
        <FlatList
          data={lessons}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },

  filterContainer: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  filterList: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterItem: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  filterItemActive: { backgroundColor: '#4F46E5' },
  filterText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  filterTextActive: { color: '#FFF' },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoSection: { flex: 1, marginRight: 8 },
  lessonTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  metaRow: { marginTop: 2 },
  metaText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },

  statusLabel: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusDone: { backgroundColor: '#DCFCE7' },
  statusProgress: { backgroundColor: '#FEF9C3' },
  statusTodo: { backgroundColor: '#F3F4F6' },
  statusLabelText: { fontSize: 10, fontWeight: '800' },
  textDone: { color: '#15803D' },
  textProgress: { color: '#A16207' },
  textTodo: { color: '#6B7280' },

  actionSection: { marginTop: 12 },
  buttonRow: { flexDirection: 'row', gap: 15 },
  btnPrimary: {
    flex: 1,
    height: 45,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnPrimaryOutline: {
    flex: 1,
    height: 45,
    borderWidth: 1.5,
    borderColor: '#4F46E5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnSecondary: {
    flex: 1,
    height: 45,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnTextWhite: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  btnTextPrimary: { color: '#4F46E5', fontWeight: '700', fontSize: 14 },
  btnTextSecondary: { color: '#475569', fontWeight: '700', fontSize: 14 },
});

export default ListeningLessonsScreen;