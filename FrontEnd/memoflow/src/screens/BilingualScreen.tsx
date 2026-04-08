import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  FlatList, TextInput, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { bilingualApi, BilingualResponse } from '../api/bilingualApi';

type SortType = 'newest' | 'oldest' | 'popular';
type ReadFilter = 'all' | 'read' | 'unread';

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'popular', label: 'Phổ biến' },
];

const READ_OPTIONS: { value: ReadFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'read', label: 'Đã đọc' },
  { value: 'unread', label: 'Chưa đọc' },
];

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
  return `${Math.max(1, Math.floor(days / 30))} tháng`;
};

// Component Dropdown dùng chung
type DropdownProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (val: T) => void;
  style?: object;
};

function Dropdown<T extends string>({ value, options, onChange, style }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const label = options.find(o => o.value === value)?.label ?? '';

  return (
    <View style={[styles.dropdownWrapper, style]}>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        onPress={() => setOpen(prev => !prev)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownValue}>{label}</Text>
        <Ionicons name="chevron-down" size={14} color="#64748B" />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownMenu}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.dropdownItem,
                opt.value === value && styles.dropdownItemActive
              ]}
              onPress={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  opt.value === value && styles.dropdownItemTextActive
                ]}
              >
                {opt.label}
              </Text>

              {opt.value === value && (
                <Ionicons name="checkmark" size={16} color="#3B82F6" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

type BilingualScreenProps = {
  onBack: () => void;
  onNavigateToBilingualDetailScreen: (lessonId: number) => void;
};

export const BilingualScreen: React.FC<BilingualScreenProps> = ({
  onBack,
  onNavigateToBilingualDetailScreen,
}) => {
  const [sort, setSort] = useState<SortType>('newest');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
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
      const res = await bilingualApi.searchBilingual(keyword, pageNum, 10, sort, readFilter);
      if (res.data?.content) {
        setArticles(prev => append ? [...prev, ...res.data.content] : res.data.content);
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
  }, [sort, readFilter, keyword]);

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
        <View>
          <Image
            source={{ uri: item.media?.url || 'https://placehold.co/300x200' }}
            style={styles.listImage}
          />
          {item.isRead && (
            <View style={styles.readBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#fff" />
              <Text style={styles.readBadgeText}>Đã đọc</Text>
            </View>
          )}
        </View>

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
              <Text style={styles.metaText}>{getRelativeTimeLabel(item.content.createdAt)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Đọc song ngữ" onBack={onBack} titleStyle={styles.headerTitle} />

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
        <Dropdown
          value={sort}
          options={SORT_OPTIONS}
          onChange={setSort}
          style={{ flex: 1, marginRight: 10 }}
        />
        <Dropdown
          value={readFilter}
          options={READ_OPTIONS}
          onChange={setReadFilter}
          style={{ flex: 1 }}
        />
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
                {articles[0].isRead && (
                  <View style={styles.featuredReadBadge}>
                    <Ionicons name="checkmark-circle" size={13} color="#fff" />
                    <Text style={styles.featuredReadBadgeText}>Đã đọc</Text>
                  </View>
                )}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>Không có bài đọc nào</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore
              ? <ActivityIndicator style={{ marginVertical: 20 }} color="#3B82F6" />
              : <View style={{ height: 20 }} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },

  searchSection: { paddingHorizontal: 16, marginTop: 10, marginBottom: 12 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E2E8F0',
    height: 50, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1E293B' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    zIndex: 999,
  },
  dropdownTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2,
  },
  dropdownValue: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginRight: 6 },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: { backgroundColor: '#EFF6FF' },
  dropdownItemText: { fontSize: 15, color: '#475569' },
  dropdownItemTextActive: { color: '#3B82F6', fontWeight: '700' },
  featuredCard: {
    height: 240, borderRadius: 24, overflow: 'hidden', marginBottom: 25,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
  },
  featuredImage: { width: '100%', height: '100%' },
  featuredReadBadge: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#10B981', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, gap: 4,
  },
  featuredReadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  featuredGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '70%', justifyContent: 'flex-end', padding: 16,
  },
  featuredTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center' },
  featuredMetaText: { color: '#E2E8F0', fontSize: 12, marginLeft: 4 },
  listContainer: { paddingHorizontal: 16 },
  listItem: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 12, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  listImage: { width: 85, height: 85, borderRadius: 16, backgroundColor: '#F1F5F9' },
  readBadge: {
    position: 'absolute', bottom: 4, left: 4,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#10B981', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2, gap: 3,
  },
  unreadBadge: { backgroundColor: '#3B82F6' },
  readBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  listTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  articleTitleSmall: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 6, lineHeight: 20 },
  articleLineSmall: { fontSize: 13, color: '#64748B', marginBottom: 8 },

  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#94A3B8', marginLeft: 4, fontWeight: '600' },
  metaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', marginHorizontal: 10 },
  metaDividerWhite: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 10 },

  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#94A3B8', fontWeight: '600' },
  centerLoader: { marginTop: 100, alignItems: 'center' },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 6,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
});