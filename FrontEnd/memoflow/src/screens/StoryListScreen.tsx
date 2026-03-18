import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { mockStoryProgress } from '../api/mockStoryData';
import { UserLessonProgress } from '../types/story';

const { width } = Dimensions.get('window');

interface StoryListScreenProps {
  stories: UserLessonProgress[];
  onBack: () => void;
  onNavigateToStory: (progress: UserLessonProgress) => void;
}

export const StoryListScreen: React.FC<StoryListScreenProps> = ({ stories, onBack, onNavigateToStory }) => {
  const [activeTab, setActiveTab] = useState<'TRUYEN' | 'DA_DOC'>('TRUYEN');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = stories.filter(progress => {
    const matchesSearch = progress.learningLesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'TRUYEN') {
      return matchesSearch && !progress.isCompleted;
    } else {
      return matchesSearch && progress.isCompleted;
    }
  });

  const renderStoryCard = ({ item, index }: { item: UserLessonProgress, index: number }) => {
    // Determine card accent color
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
              style={[styles.readButton, { backgroundColor: activeTab === 'TRUYEN' ? '#EBF8F2' : '#F3E8FF' }]}
              onPress={() => onNavigateToStory(item)}
            >
              <Text style={[styles.readButtonText, { color: activeTab === 'TRUYEN' ? '#38A169' : '#805AD5' }]}>
                {activeTab === 'TRUYEN' ? 'Đọc ngay' : 'Đọc lại'}
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
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'TRUYEN' && styles.activeTab]} 
          onPress={() => setActiveTab('TRUYEN')}
        >
          <Text style={[styles.tabText, activeTab === 'TRUYEN' && styles.activeTabText]}>TRUYỆN</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'DA_DOC' && styles.activeTab]} 
          onPress={() => setActiveTab('DA_DOC')}
        >
          <Text style={[styles.tabText, activeTab === 'DA_DOC' && styles.activeTabText]}>ĐÃ ĐỌC XONG</Text>
        </TouchableOpacity>
      </View>

      {/* Story List */}
      <FlatList
        data={filteredStories}
        renderItem={renderStoryCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy truyện nào.</Text>
          </View>
        }
      />
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
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
});
