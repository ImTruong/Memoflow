import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { flashcardApi } from '../api/flashcardApi';
import { FlashcardSetCard } from '../components/FlashcardSetCard';
import { FlashcardActionOverlay } from '../components/FlashcardActionOverlay';
import { useFlashcardLessons } from '../hooks/useFlashcardLessons';
import { useUser } from '../hooks/useUser';

const { width } = Dimensions.get('window');

type FlashcardSetScreenProps = {
  onBack: () => void;
  onNavigateToCreate: () => void;
  onNavigateToEdit: (id: number, isOwner?: boolean) => void; // Add isOwner param
  onNavigateToStudy: (setName: string, id: number, onlyDue: boolean, isGlobal?: boolean) => void;
  onNavigateToGame: (setName: string, id: number) => void;
  refreshTrigger?: number;
};

/**
 * FlashcardSetScreen - Displays personal and community flashcard sets with tabbed navigation.
 */
export const FlashcardSetScreen: React.FC<FlashcardSetScreenProps> = ({ 
  onBack, 
  onNavigateToCreate, 
  onNavigateToEdit,
  onNavigateToStudy,
  onNavigateToGame,
  refreshTrigger
}) => {
  const [activeTab, setActiveTab] = useState<'Mine' | 'Community'>('Mine');
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [selectedSetName, setSelectedSetName] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const mine = useFlashcardLessons('Mine');
  const community = useFlashcardLessons('Community');
  const { profile } = useUser();
  
  const scrollRef = useRef<ScrollView>(null);

  // Filter items based on search query
  const filterItems = (items: any[]) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredMineItems = filterItems(mine.items);
  const filteredCommunityItems = filterItems(community.items);

  // --- Handlers ---

  const handleTabPress = (tab: 'Mine' | 'Community') => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ x: tab === 'Mine' ? 0 : width, animated: true });
    
    // Lazy load community tab if empty
    if (tab === 'Community' && community.items.length === 0) {
      community.refresh();
    }
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery('');
    }
  };

  useEffect(() => {
    if (refreshTrigger) {
      mine.refresh();
      if (activeTab === 'Community') {
        community.refresh();
      }
    }
  }, [refreshTrigger]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const tab = offsetX < width / 2 ? 'Mine' : 'Community';
    if (tab !== activeTab) {
      setActiveTab(tab);
      if (tab === 'Community' && community.items.length === 0) {
        community.refresh();
      }
    }
  };

  const handleSetAction = (setName: string, id: number, isOwner?: boolean) => {
    setSelectedSetName(setName);
    setSelectedLessonId(id);
    
    // Find the selected item to get isOwner flag
    const selectedItem = activeTab === 'Mine' 
      ? mine.items.find(item => item.id === id)
      : community.items.find(item => item.id === id);
    
    // Only show overlay if user is owner or wants to study
    setIsOverlayVisible(true);
  };

  const handleDeleteSet = async () => {
    if (!selectedLessonId) return;

    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa bộ thẻ "${selectedSetName}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              const response = await flashcardApi.deleteLesson(selectedLessonId);
              if (response.success) {
                // Show success message
                Alert.alert("Thành công", "Đã xóa bộ thẻ thành công!");
                
                // Refresh the appropriate tab
                if (activeTab === 'Mine') {
                  mine.refresh();
                } else {
                  community.refresh();
                }
                
                setIsOverlayVisible(false);
              } else {
                Alert.alert("Lỗi", response.message || "Không thể xóa bộ thẻ này.");
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Lỗi", "Không thể xóa bộ thẻ này. Vui lòng thử lại.");
            }
          }
        }
      ]
    );
  };

  const renderListEmpty = (state: ReturnType<typeof useFlashcardLessons>) => {
    if (state.isInitialLoading) {
      return (
        <View style={styles.centerStateWrapper}>
          <ActivityIndicator size="large" color="#5B62E3" />
        </View>
      );
    }

    if (state.error) {
      return (
        <View style={styles.centerStateWrapper}>
          <Text style={styles.stateMessage}>Không thể tải danh sách. {state.error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => state.refresh()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerStateWrapper}>
        <Text style={styles.stateMessage}>Chưa có bộ từ nào.</Text>
      </View>
    );
  };

  const renderFooter = (isLoadingMore: boolean) => (
    isLoadingMore ? (
      <View style={styles.loadingMoreWrapper}>
        <ActivityIndicator size="small" color="#5B62E3" />
      </View>
    ) : null
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        {isSearchVisible ? (
          <View style={styles.searchHeaderContainer}>
            <TouchableOpacity style={styles.backBtn} onPress={toggleSearch}>
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm bộ từ vựng..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bộ từ vựng</Text>
            <TouchableOpacity style={styles.searchBtn} onPress={toggleSearch}>
              <Ionicons name="search-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          <TabButton 
            title="Của tôi" 
            isActive={activeTab === 'Mine'} 
            onPress={() => handleTabPress('Mine')} 
          />
          <TabButton 
            title="Cộng đồng" 
            isActive={activeTab === 'Community'} 
            onPress={() => handleTabPress('Community')} 
          />
        </View>
      </View>

      {/* Main Content (Horizontal Scroll View) */}
      <ScrollView 
        ref={scrollRef}
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.horizontalScroll}
      >
        {/* Personal Sets Tab */}
        <View style={styles.tabPane}>
          <FlatList
            data={filteredMineItems}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            ListHeaderComponent={
              <CreateSetButton onPress={onNavigateToCreate} />
            }
            renderItem={({ item }) => (
              <FlashcardSetCard {...item} onPress={() => handleSetAction(item.title, item.id)} />
            )}
            onEndReached={mine.loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter(mine.isLoadingMore)}
            ListEmptyComponent={renderListEmpty(mine)}
          />
        </View>

        {/* Community Sets Tab */}
        <View style={styles.tabPane}>
          <FlatList
            data={filteredCommunityItems}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            renderItem={({ item }) => (
              <FlashcardSetCard {...item} onPress={() => handleSetAction(item.title, item.id)} />
            )}
            onEndReached={community.loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter(community.isLoadingMore)}
            ListEmptyComponent={renderListEmpty(community)}
          />
        </View>
      </ScrollView>

      {/* Action Sheet Overlay */}
      <FlashcardActionOverlay
        isVisible={isOverlayVisible}
        isOwner={(() => {
          const selectedItem = activeTab === 'Mine' 
            ? mine.items.find(item => item.id === selectedLessonId)
            : community.items.find(item => item.id === selectedLessonId);
          return (selectedItem?.isOwner || (profile && selectedItem?.creatorId === profile.id)) ?? true;
        })()}
        onClose={() => setIsOverlayVisible(false)}
        onEdit={() => { 
          setIsOverlayVisible(false); 
          if (selectedLessonId) {
            const selectedItem = activeTab === 'Mine' 
              ? mine.items.find(item => item.id === selectedLessonId)
              : community.items.find(item => item.id === selectedLessonId);
            const isOwnerValue = (selectedItem?.isOwner || (profile && selectedItem?.creatorId === profile.id)) ?? true;
            onNavigateToEdit(selectedLessonId, isOwnerValue);
          }
        }}
        onDelete={handleDeleteSet}
        onLearnAll={() => { 
          setIsOverlayVisible(false); 
          if (selectedLessonId) onNavigateToStudy(selectedSetName, selectedLessonId, false); 
        }}
        onLearnDue={() => { 
          setIsOverlayVisible(false); 
          if (selectedLessonId) onNavigateToStudy(selectedSetName, selectedLessonId, true); 
        }}
        onGame={() => { 
          setIsOverlayVisible(false); 
          if (selectedLessonId) onNavigateToGame(selectedSetName, selectedLessonId); 
        }}
      />
    </View>
  );
};

// --- Helper Components ---

const TabButton = ({ title, isActive, onPress }: { title: string, isActive: boolean, onPress: () => void }) => (
  <TouchableOpacity 
    style={[styles.tabItem, isActive && styles.activeTabItem]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
  </TouchableOpacity>
);

const CreateSetButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.createBtn} onPress={onPress}>
    <View style={styles.createIconContainer}>
      <MaterialCommunityIcons name="plus" size={24} color="#5B62E3" />
    </View>
    <Text style={styles.createText}>Tạo bộ từ mới</Text>
  </TouchableOpacity>
);

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
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabItem: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#5B62E3',
  },
  horizontalScroll: {
    flex: 1,
  },
  tabPane: {
    width: width,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  createSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#DBEAFE',
    borderStyle: 'dashed',
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
  },
  createIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  createText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5B62E3',
  },
  loadingMoreWrapper: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  centerStateWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  stateMessage: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  searchHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
});
