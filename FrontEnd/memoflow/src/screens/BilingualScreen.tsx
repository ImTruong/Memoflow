import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { bilingualApi, BilingualResponse } from '../api/bilingualApi';

type FilterType = 'newest' | 'oldest' | 'popular';

type BilingualScreenProps = {
  onBack: () => void;
  onNavigateToBilingualDetailScreen: (lessonId: number) => void;
};

const getRelativeTimeLabel = (createdAt: string) => {
  if (!createdAt) return '';
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));

  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} tuần`;
  const months = Math.floor(days / 30);
  return `${Math.max(1, months)} tháng`;
};

export const BilingualScreen: React.FC<BilingualScreenProps> = ({
  onBack,
  onNavigateToBilingualDetailScreen,
}) => {
  const [filter, setFilter] = useState<FilterType>('newest');
  const [keyword, setKeyword] = useState('');
  const [articles, setArticles] = useState<BilingualResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = async (pageNum: number, append = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await bilingualApi.searchBilingual(keyword, pageNum, 10, filter);
      if (res.data?.content) {
        setArticles(prev =>
          append ? [...prev, ...res.data.content] : res.data.content
        );
        setHasMore(!res.data.last);
      }
    } catch (err) {
      console.error('Error fetching bilingual lessons', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchArticles(0);
  }, [filter, keyword]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(nextPage, true);
    }
  };

  const renderItem = ({ item }: { item: BilingualResponse }) => {
    const firstParagraph = item.content.paragraphs?.[0];

    return (
      <TouchableOpacity
        style={styles.listItem}
        activeOpacity={0.7}
        onPress={() => onNavigateToBilingualDetailScreen(item.id)}
      >
        <Image
          source={{ uri: item.media?.url || 'https://placehold.co/300x200' }}
          style={styles.listImage}
        />
        <View style={styles.listTextContainer}>
          <Text style={styles.articleTitleSmall} numberOfLines={2}>{item.title}</Text>

          {firstParagraph && (
            <Text style={styles.articleLineSmall} numberOfLines={1}>
              {firstParagraph.en}
            </Text>
          )}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={14} color="#94A3B8" />
              <Text style={styles.metaText}>{item.content.views}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#94A3B8" />
              <Text style={styles.metaText}>
                {getRelativeTimeLabel(item.content.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Đọc song ngữ"
        onBack={onBack}
        titleStyle={styles.headerTitle}
      />

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài đọc..."
            placeholderTextColor="#94A3B8"
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['newest', 'oldest', 'popular'] as FilterType[]).map(ft => (
          <TouchableOpacity
            key={ft}
            style={[styles.filterChip, filter === ft && styles.filterChipActive]}
            onPress={() => setFilter(ft)}
          >
            <Text style={[styles.filterText, filter === ft && styles.filterTextActive]}>
              {ft === 'newest' ? 'Mới nhất' : ft === 'oldest' ? 'Cũ nhất' : 'Phổ biến'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={articles.slice(1)}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            articles.length > 0 ? (
              <TouchableOpacity
                style={styles.featuredCard}
                activeOpacity={0.9}
                onPress={() => onNavigateToBilingualDetailScreen(articles[0].id)}
              >
                <Image
                  source={{ uri: articles[0].media?.url || 'https://placehold.co/600x400' }}
                  style={styles.featuredImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.featuredGradient}
                >
                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {articles[0].title}
                  </Text>
                  <View style={styles.featuredMeta}>
                    <Ionicons name="eye" size={14} color="#E2E8F0" />
                    <Text style={styles.featuredMetaText}>{articles[0].content.views} lượt xem</Text>
                    <View style={styles.metaDividerWhite} />
                    <Ionicons name="time" size={14} color="#E2E8F0" />
                    <Text style={styles.featuredMetaText}>
                      {getRelativeTimeLabel(articles[0].content.createdAt)} trước
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 20 }} color="#3B82F6" />
            ) : <View style={{ height: 20 }} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },

  searchSection: { paddingHorizontal: 16, marginTop: 10, marginBottom: 15 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1E293B' },

  filterRow: { flexDirection: 'row', marginBottom: 20, paddingHorizontal: 16 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  filterTextActive: { color: '#FFF' },

  featuredCard: {
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  featuredImage: { width: '100%', height: '100%' },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredTag: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featuredTagText: { color: '#FFF', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  featuredTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center' },
  featuredMetaText: { color: '#E2E8F0', fontSize: 12, marginLeft: 4 },

  listContainer: { paddingHorizontal: 16 },
  listItem: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  listImage: { width: 85, height: 85, borderRadius: 16, backgroundColor: '#F1F5F9' },
  listTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  articleTitleSmall: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 6, lineHeight: 20 },
  articleLineSmall: { fontSize: 13, color: '#64748B', marginBottom: 8 },

  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#94A3B8', marginLeft: 4, fontWeight: '600' },
  metaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', marginHorizontal: 10 },
  metaDividerWhite: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 10 },

  centerLoader: { marginTop: 100, alignItems: 'center' },
});