import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Image,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { UserLessonProgress } from '../types/story';

const { width } = Dimensions.get('window');

interface StoryListScreenProps {
  stories: UserLessonProgress[];
  onBack: () => void;
  onNavigateToStory: (progress: UserLessonProgress) => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const StoryListScreen: React.FC<StoryListScreenProps> = ({
  stories,
  onBack,
  onNavigateToStory,
  isLoading = false,
  error = null,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'TRUYEN' | 'DA_DOC'>('TRUYEN');
  const [searchQuery, setSearchQuery] = useState('');
  const horizontalScrollRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Chuyen tab bang nut bam va dong bo vi tri FlatList ngang.
  const handleTabPress = (tab: 'TRUYEN' | 'DA_DOC') => {
    setActiveTab(tab);
    horizontalScrollRef.current?.scrollToIndex({ 
      index: tab === 'TRUYEN' ? 0 : 1, 
      animated: true 
    });
  };

  // Cap nhat tab hien tai khi user vuot ngang giua danh sach chua doc/da doc.
  const handleScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setActiveTab(index === 0 ? 'TRUYEN' : 'DA_DOC');
  };

  // Tao hieu ung opacity cho tab khi user vuot ngang.
  const truyenOpacity = scrollX.interpolate({
    inputRange: [0, width],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  const daDocOpacity = scrollX.interpolate({
    inputRange: [0, width],
    outputRange: [0.5, 1],
    extrapolate: 'clamp',
  });

  const indicatorTranslateX = scrollX.interpolate({
    inputRange: [0, width],
    outputRange: [0, width / 2],
    extrapolate: 'clamp',
  });

  // Render mot card truyen chem kem anh minh hoa va nut doc/doc lai.
  const renderStoryCard = ({ item, index }: { item: UserLessonProgress, index: number }) => {
    // Doi mau nhan theo vi tri de danh sach de phan biet hon.
    const colors_list = [colors.primary, '#9F7AEA', '#F6AD55', '#4299E1', '#48BB78'];
    const accentColor = colors_list[index % colors_list.length];
    const lesson = item.learningLesson;

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => onNavigateToStory(item)}
        activeOpacity={0.9}
      >
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{lesson.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {lesson.description}
            </Text>
            <TouchableOpacity 
              style={[styles.readButton, { backgroundColor: item.isCompleted ? '#F3E8FF' : '#EBF8F2' }]}
              onPress={() => onNavigateToStory(item)}
            >
              <Text style={[styles.readButtonText, { color: item.isCompleted ? '#805AD5' : '#38A169' }]}>
                {item.isCompleted ? 'Đọc lại' : 'Đọc ngay'}
              </Text>
            </TouchableOpacity>
          </View>
          {lesson.image?.url && (
            <Image source={{ uri: lesson.image.url }} style={styles.thumbnail} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Truyện chêm</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm truyện..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={styles.tab} 
            onPress={() => handleTabPress('TRUYEN')}
          >
            <Animated.Text style={[styles.tabText, { opacity: truyenOpacity, color: truyenOpacity.interpolate({ inputRange: [0.5, 1], outputRange: [colors.textSecondary, colors.primary] }) }]}>
              TRUYỆN
            </Animated.Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tab} 
            onPress={() => handleTabPress('DA_DOC')}
          >
            <Animated.Text style={[styles.tabText, { opacity: daDocOpacity, color: daDocOpacity.interpolate({ inputRange: [0.5, 1], outputRange: [colors.textSecondary, colors.primary] }) }]}>
              ĐÃ ĐỌC XONG
            </Animated.Text>
          </TouchableOpacity>
        </View>
        {/* Animated Underline */}
        <Animated.View style={[styles.activeIndicator, { transform: [{ translateX: indicatorTranslateX }] }]} />
      </View>

      {/* Story List with Horizontal Swipe */}
      {isLoading && stories.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải truyện...</Text>
        </View>
      ) : error && stories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
          {onRefresh && (
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Tải lại</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Animated.FlatList
          ref={horizontalScrollRef as any}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          data={['TRUYEN', 'DA_DOC']}
          keyExtractor={item => item}
          renderItem={({ item: tab }) => (
            <View style={{ width: width }}>
              <FlatList
                data={stories.filter(p => {
                  const matchesSearch = p.learningLesson.title.toLowerCase().includes(searchQuery.toLowerCase());
                  return matchesSearch && (tab === 'TRUYEN' ? !p.isCompleted : p.isCompleted);
                })}
                renderItem={renderStoryCard}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {tab === 'TRUYEN' ? 'Chưa có truyện nào cần đọc.' : 'Bạn chưa hoàn thành truyện nào.'}
                    </Text>
                  </View>
                }
              />
            </View>
          )}
        />
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...typography.h2,
    marginBottom: 0,
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    borderRadius: 25,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  tabsWrapper: {
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: width / 2,
    height: 3,
    backgroundColor: colors.primary,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 4,
  },
  cardAccent: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  readButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  readButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
