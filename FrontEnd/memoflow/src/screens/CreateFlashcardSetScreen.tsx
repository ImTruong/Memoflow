import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Switch, 
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import type { WordFormData } from './AddWordScreen';

import * as ImagePicker from 'expo-image-picker';
import { flashcardApi } from '../api/flashcardApi';
import { Toast } from '../components/shared/Toast';
import { WordResponse } from '../types/flashcard';

type CreateFlashcardSetScreenProps = {
  onBack: () => void;
  editMode?: boolean;
  lessonId?: number;
  onAddWord?: (word?: string) => void;
  onEditWord?: (data: WordFormData) => void;
  onSetCreated?: (id: number) => void;
  refreshTrigger?: number;
  isOwner?: boolean; // New prop to check ownership
};

// Stable Header Component to prevent focus loss
const SetHeader = React.memo(({ 
  setName, setSetName, 
  description, setDescription, 
  isPublic, setIsPublic, 
  imageUri, handlePickImage, setImageUri,
  totalWords,
  searchKeyword, setSearchKeyword,
  handleAddWordPress,
  isOwner = true // Add isOwner prop
}: any) => {
  return (
    <View onStartShouldSetResponder={() => true}>
      <View style={styles.topSection}>
        <TouchableOpacity 
          style={[
            styles.imagePicker, 
            imageUri && styles.imagePickerActive,
            !isOwner && styles.disabledButton
          ]} 
          onPress={isOwner ? handlePickImage : undefined}
          disabled={!isOwner}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.pickedImage} />
          ) : (
            <View style={styles.pickerContent}>
              <Ionicons name="camera" size={24} color="#9CA3AF" />
              <Text style={styles.pickerText}>Ảnh</Text>
            </View>
          )}
          {imageUri && (
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <View style={styles.nameHeaderSection}>
          <Text style={styles.label}>Tên bộ từ</Text>
          <View style={styles.nameInputContainer}>
            <TextInput
              style={[styles.nameInput, !isOwner && styles.disabledInput]}
              placeholder="Ví dụ: IELTS Vocabulary..."
              value={setName}
              onChangeText={isOwner ? setSetName : undefined}
              placeholderTextColor="#9CA3AF"
              editable={isOwner}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Mô tả (Không bắt buộc)</Text>
        <TextInput
          style={[styles.input, styles.textArea, !isOwner && styles.disabledInput]}
          placeholder="Mô tả ngắn gọn về bộ từ này..."
          value={description}
          onChangeText={isOwner ? setDescription : undefined}
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          editable={isOwner}
        />
      </View>

      <View style={[styles.section, styles.switchContainer]}>
        <View style={styles.switchInfo}>
          <View style={styles.switchIcon}>
            <Ionicons name="earth" size={24} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.switchTitle}>Chế độ</Text>
            <Text style={styles.switchSub}>{isPublic ? 'Công khai' : 'Riêng tư'}</Text>
          </View>
        </View>
        <Switch
          value={isPublic}
          onValueChange={isOwner ? setIsPublic : undefined}
          trackColor={{ false: '#D1D5DB', true: '#5B62E3' }}
          thumbColor="#FFFFFF"
          disabled={!isOwner}
        />
      </View>

      <View style={styles.wordSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh sách từ vựng</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{totalWords} từ</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Tìm từ trong bộ..."
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
          />
        </View>

        {isOwner && (
          <>
            <Text style={styles.hintTitle}>GỢI Ý TỪ VỰNG</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hintsScroll}>
              <TouchableOpacity 
                style={[styles.hintBtn, { backgroundColor: '#EEF2FF' }]}
                onPress={() => handleAddWordPress('Adventure')}
              >
                <Text style={[styles.hintText, { color: '#5B62E3' }]}>+ Adventure</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.hintBtn, { backgroundColor: '#ECFDF5' }]}
                onPress={() => handleAddWordPress('Journey')}
              >
                <Text style={[styles.hintText, { color: '#10B981' }]}>+ Journey</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.hintBtn, { backgroundColor: '#F5F3FF' }]}
                onPress={() => handleAddWordPress('Baggage')}
              >
                <Text style={[styles.hintText, { color: '#8B5CF6' }]}>+ Baggage</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity 
              style={styles.addWordBtn}
              onPress={() => handleAddWordPress()}
            >
              <MaterialCommunityIcons name="plus-circle" size={24} color="#5B62E3" />
              <Text style={styles.addWordText}>Thêm từ mới</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
});

export const CreateFlashcardSetScreen: React.FC<CreateFlashcardSetScreenProps> = ({ 
  onBack, 
  editMode = false,
  lessonId: initialLessonId,
  onAddWord,
  onEditWord,
  onSetCreated,
  refreshTrigger = 0,
  isOwner = true // Default to true for backward compatibility
}) => {
  const [isPublic, setIsPublic] = useState(true);
  const [setName, setSetName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(initialLessonId || null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Words Paging State
  const [words, setWords] = useState<WordResponse[]>([]);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isWordsLoading, setIsWordsLoading] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success'|'error' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  const searchTimeout = useRef<any>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  // --- Data Fetching ---

  useEffect(() => {
    if (initialLessonId) {
      fetchLessonDetail(initialLessonId);
    }
  }, [initialLessonId]);

  const fetchLessonDetail = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await flashcardApi.getLessonDetail(id, 0, 15);
      if (response.success) {
        const { lessonInfo, words: wordsPage } = response.data;
        setSetName(lessonInfo.title);
        setDescription(lessonInfo.description || '');
        setImageUri(lessonInfo.imageUrl || null);
        setIsPublic(lessonInfo.content?.privacyMode === 'PUBLIC');
        
        setWords(wordsPage.content);
        setPage(0);
        setIsLastPage(wordsPage.last);
        setTotalWords(wordsPage.totalElements);
      }
    } catch (error: any) {
      showToast('Không thể tải thông tin bộ từ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWords = async (id: number, p: number, keyword: string = '', append: boolean = false) => {
    try {
      setIsWordsLoading(true);
      const response = await flashcardApi.getLessonWords(id, p, 15, keyword);
      if (response.success) {
        if (append) {
          setWords(prev => [...prev, ...response.data.content]);
        } else {
          setWords(response.data.content);
          setTotalWords(response.data.totalElements);
        }
        setPage(p);
        setIsLastPage(response.data.last);
      }
    } catch (error: any) {
      console.error('Fetch words error:', error);
    } finally {
      setIsWordsLoading(false);
    }
  };

  useEffect(() => {
    if (currentLessonId) {
      fetchWords(currentLessonId, 0, searchKeyword, false);
    }
  }, [refreshTrigger, currentLessonId]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!currentLessonId) return;

    searchTimeout.current = setTimeout(() => {
        fetchWords(currentLessonId, 0, searchKeyword, false);
    }, 500);

    return () => clearTimeout(searchTimeout.current);
  }, [searchKeyword, currentLessonId]);

  const loadMoreWords = async () => {
    if (isWordsLoading || isLastPage || !currentLessonId) return;
    fetchWords(currentLessonId, page + 1, searchKeyword, true);
  };

  // --- Handlers ---

  const ensureLessonCreated = async () => {
    if (currentLessonId || editMode) return true;

    if (!setName.trim()) {
      showToast('Vui lòng nhập tên bộ từ trước!', 'error');
      return false;
    }

    try {
      setIsLoading(true);
      const activityId = 1; 
      const response = await flashcardApi.createLesson(activityId, {
        title: setName,
        description: description,
        privacyMode: isPublic ? 'PUBLIC' : 'PRIVATE',
        image: imageUri
      });

      if (response.success) {
        setCurrentLessonId(response.data.id);
        onSetCreated?.(response.data.id);
        showToast('Đã khởi tạo bộ từ thành công!', 'success');
        return true;
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tạo bộ từ', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWordPress = async (word?: string) => {
    const created = await ensureLessonCreated();
    if (created) {
      onAddWord?.(word);
    }
  };

  const handleSave = async () => {
    if (!setName.trim()) {
      showToast('Vui lòng nhập tên bộ từ!', 'error');
      return;
    }

    try {
      setIsLoading(true);
      let response;
      if (currentLessonId) {
        response = await flashcardApi.updateLesson(currentLessonId, {
          title: setName,
          description: description,
          privacyMode: isPublic ? 'PUBLIC' : 'PRIVATE',
          image: imageUri
        });
      } else {
        const activityId = 1;
        response = await flashcardApi.createLesson(activityId, {
          title: setName,
          description: description,
          privacyMode: isPublic ? 'PUBLIC' : 'PRIVATE',
          image: imageUri
        });
        if (response.success) {
          setCurrentLessonId(response.data.id);
          onSetCreated?.(response.data.id);
        }
      }

      if (response?.success) {
        showToast(editMode ? 'Đã cập nhật bộ từ!' : 'Đã lưu bộ từ thành công!', 'success');
      }
    } catch (error: any) {
      showToast('Lỗi khi lưu bộ từ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentLessonId) return;

    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa bộ thẻ này không? Toàn bộ từ vựng bên trong cũng sẽ bị xóa.",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await flashcardApi.deleteLesson(currentLessonId);
              if (response.success) {
                onBack();
              }
            } catch (error) {
              showToast('Lỗi khi xóa bộ từ', 'error');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteWord = async (id: number, wordName: string) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa từ "${wordName}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsWordsLoading(true);
              const response = await flashcardApi.deleteWord(id);
              if (response.success) {
                // Refresh list
                fetchWords(currentLessonId!, 0, searchKeyword, false);
                showToast('Đã xóa từ vựng', 'success');
              }
            } catch (error) {
              showToast('Lỗi khi xóa từ', 'error');
            } finally {
              setIsWordsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Cần quyền truy cập ảnh để đổi ảnh bìa!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const renderWord = useCallback(({ item }: { item: WordResponse }) => (
    <TouchableOpacity 
      style={[styles.wordCard, !isOwner && styles.disabledButton]}
      onPress={isOwner ? () => onEditWord?.({
        id: item.id,
        term: item.name,
        phonetic: item.ipa || '',
        definition: item.definition,
        example: item.example || '',
        imageUri: item.imageUrl || undefined,
        audioUrl: item.audioUrl || undefined
      } as any) : undefined}
      disabled={!isOwner}
    >
      <View style={styles.wordImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.wordImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={24} color="#9CA3AF" />
          </View>
        )}
      </View>
      <View style={styles.wordInfo}>
        <View style={styles.wordHeader}>
          <Text style={styles.wordTerm}>{item.name}</Text>
          <Text style={styles.wordPhonetic}>{item.ipa}</Text>
        </View>
        <Text style={styles.wordDef} numberOfLines={2}>{item.definition}</Text>
      </View>
      {/* Only show delete button for owners */}
      {isOwner && (
        <TouchableOpacity 
          style={styles.deleteWordBtn}
          onPress={() => handleDeleteWord(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  ), [onEditWord, isOwner]);

  return (
    <View style={styles.container}>
      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onHide={() => setToast({ ...toast, visible: false })} 
      />

      <ScreenHeader
        title={editMode ? 'Sửa bộ từ' : 'Tạo bộ từ mới'}
        onBack={onBack}
        backIconName="arrow-back"
      />

      <FlatList
        data={words}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderWord}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <SetHeader 
              setName={setName} setSetName={setSetName}
              description={description} setDescription={setDescription}
              isPublic={isPublic} setIsPublic={setIsPublic}
              imageUri={imageUri} handlePickImage={handlePickImage} setImageUri={setImageUri}
              totalWords={totalWords}
              searchKeyword={searchKeyword} setSearchKeyword={setSearchKeyword}
              handleAddWordPress={handleAddWordPress}
              isOwner={isOwner}
          />
        }
        ListEmptyComponent={
          !isWordsLoading && words.length === 0 ? (
            <View style={styles.emptyWordsContainer}>
              <Ionicons name="documents-outline" size={48} color="#E2E8F0" />
              <Text style={styles.emptyWordsText}>
                {searchKeyword ? 'Không tìm thấy từ nào phù hợp' : 'Chưa có từ nào trong bộ này'}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isWordsLoading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color="#5B62E3" />
          ) : <View style={{ height: 100 }} />
        }
        onEndReached={loadMoreWords}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        {/* Only show delete button for owners in edit mode */}
        {editMode && isOwner && (
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        )}
        {/* Only show save button for owners */}
        {isOwner && (
          <TouchableOpacity 
            style={[styles.saveBtn, isLoading && { opacity: 0.7 }, { flex: 1 }]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="save-outline" size={24} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Lưu bộ từ</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  switchSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  wordSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  countBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginBottom: 12,
    marginLeft: 4,
  },
  hintsScroll: {
    marginBottom: 20,
  },
  hintBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
  },
  hintText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addWordBtn: {
    height: 60,
    borderWidth: 2,
    borderColor: '#DBEAFE',
    borderStyle: 'dashed',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
  },
  addWordText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5B62E3',
    marginLeft: 8,
  },
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  wordImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  wordImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  wordTerm: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  wordPhonetic: {
    fontSize: 12,
    color: '#3B82F6',
  },
  wordDef: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  deleteWordBtn: {
    padding: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  deleteBtn: {
    width: 64,
    height: 64,
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  imagePicker: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  imagePickerActive: {
    borderStyle: 'solid',
    borderColor: '#F3F4F6',
  },
  pickerContent: {
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: 'bold',
    marginTop: 2,
  },
  pickedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 9,
  },
  nameHeaderSection: {
    flex: 1,
    justifyContent: 'center',
  },
  nameInputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  nameInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    padding: 0,
  },
  emptyWordsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 10,
  },
  emptyWordsText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
