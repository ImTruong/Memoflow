import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { flashcardApi } from '../api/flashcardApi';
import * as ImagePicker from 'expo-image-picker';
import { Toast } from '../components/shared/Toast';
import { Audio } from 'expo-av';

type AddWordScreenProps = {
  onBack: () => void;
  lessonId: number;
  editMode?: boolean;
  initialWord?: string;
  initialData?: WordFormData;
};

export type WordFormData = {
  id?: number;
  term: string;
  phonetic: string;
  definition: string;
  example: string;
  imageUri?: string;
  audioUrl?: string;
};

export const AddWordScreen: React.FC<AddWordScreenProps> = ({ 
  onBack, 
  lessonId,
  editMode = false, 
  initialWord = '',
  initialData
}) => {
  const [term, setTerm] = useState(initialWord || initialData?.term || '');
  const [phonetic, setPhonetic] = useState(initialData?.phonetic || '');
  const [definition, setDefinition] = useState(initialData?.definition || '');
  const [example, setExample] = useState(initialData?.example || '');
  const [imageUri, setImageUri] = useState(initialData?.imageUri || null);
  const [audioUrl, setAudioUrl] = useState(initialData?.audioUrl || '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success'|'error' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (initialWord) setTerm(initialWord);
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [initialWord, sound]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Cần quyền truy cập ảnh!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleDictionarySearch = async () => {
    if (!term.trim()) return;

    try {
      setIsSearching(true);
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${term.trim().toLowerCase()}`);
      if (response.ok) {
        const data = await response.json();
        const options: any[] = [];
        data.forEach((entry: any) => {
          // Extract general audio from the entry
          const entryAudio = entry.phonetics?.find((p: any) => p.audio && p.audio !== '')?.audio || '';
          
          entry.meanings.forEach((meaning: any) => {
            meaning.definitions.forEach((def: any) => {
              options.push({
                term: entry.word,
                phonetic: entry.phonetic || (entry.phonetics && entry.phonetics[0]?.text) || '',
                definition: def.definition,
                example: def.example || '',
                partOfSpeech: meaning.partOfSpeech,
                audioUrl: entryAudio
              });
            });
          });
        });
        
        if (options.length > 0) {
          setSearchResults(options);
          setShowResultsModal(true);
        } else {
          showToast('Không tìm thấy thông tin từ này', 'error');
        }
      } else {
        showToast('Không tìm thấy từ này trong từ điển', 'error');
      }
    } catch (error) {
      showToast('Lỗi khi kết nối từ điển', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result: any) => {
    setPhonetic(result.phonetic);
    setDefinition(result.definition);
    setExample(result.example);
    setAudioUrl(result.audioUrl);
    setShowResultsModal(false);
    if (result.audioUrl) {
      playPreview(result.audioUrl);
    }
  };

  const playPreview = async (url: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Playback Error', error);
    }
  };

  const handlePlayAudio = async () => {
    if (!audioUrl) return;
    playPreview(audioUrl);
  };

  const handleSave = async () => {
    if (!term.trim() || !definition.trim()) {
      showToast('Vui lòng nhập từ và nghĩa!', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        name: term,
        ipa: phonetic,
        definition: definition,
        example: example,
        image: imageUri,
        audioUrl: audioUrl
      };

      let response;
      if (editMode && initialData?.id) {
        response = await flashcardApi.updateWord(initialData.id, payload);
      } else {
        response = await flashcardApi.createWord(lessonId, payload);
      }

      if (response.success) {
        showToast(editMode ? 'Cập nhật từ thành công!' : 'Thêm từ thành công!', 'success');
        setTimeout(() => onBack(), 1000);
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi lưu từ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onHide={() => setToast({ ...toast, visible: false })} 
      />

      <ScreenHeader
        title={editMode ? 'Sửa từ vựng' : 'Thêm từ mới'}
        onBack={onBack}
        backIconName="arrow-back"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Từ vựng</Text>
          <View style={styles.inputWithActions}>
            <TextInput
              style={[styles.input, styles.termInput]}
              value={term}
              onChangeText={setTerm}
              placeholder="Ví dụ: Serendipity"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={handleDictionarySearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#5B62E3" />
              ) : (
                <MaterialCommunityIcons name="magic-staff" size={20} color="#5B62E3" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.actionBtn, !audioUrl && styles.actionBtnDisabled]} 
                onPress={handlePlayAudio}
                disabled={!audioUrl}
            >
              <Ionicons name="volume-high-outline" size={20} color={audioUrl ? "#3B82F6" : "#D1D5DB"} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Phiên âm (IPA)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={phonetic}
              onChangeText={setPhonetic}
              placeholder="/ˌserənˈdipədē/"
              placeholderTextColor="#9CA3AF"
            />
            <MaterialCommunityIcons name="microphone-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          </View>

          <Text style={styles.label}>Nghĩa của từ</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={definition}
            onChangeText={setDefinition}
            placeholder="Sự tình cờ, may mắn tìm ra những điều thú vị..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Ví dụ</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={example}
            onChangeText={setExample}
            placeholder="It was pure serendipity that we met..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Hình ảnh</Text>
          <TouchableOpacity 
            style={[styles.imagePicker, imageUri && styles.imagePickerActive]} 
            onPress={handlePickImage}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.pickedImage} />
            ) : (
              <View style={styles.pickerContent}>
                <View style={styles.pickerIconBg}>
                  <Ionicons name="image" size={24} color="#9CA3AF" />
                </View>
                <Text style={styles.pickerText}>Tải ảnh lên</Text>
              </View>
            )}
            {imageUri && (
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveBtn, isLoading && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveText}>{editMode ? 'Cập nhật' : 'Lưu'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showResultsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResultsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ý nghĩa phù hợp</Text>
              <TouchableOpacity onPress={() => setShowResultsModal(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.resultItem}
                  onPress={() => selectResult(item)}
                >
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultPartOfSpeech}>{item.partOfSpeech}</Text>
                    <Text style={styles.resultPhonetic}>{item.phonetic}</Text>
                    {item.audioUrl ? (
                      <Ionicons name="volume-high" size={16} color="#3B82F6" />
                    ) : null}
                  </View>
                  <Text style={styles.resultDef}>{item.definition}</Text>
                  {item.example ? (
                    <Text style={styles.resultEx}>Ex: {item.example}</Text>
                  ) : null}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  formSection: {
    gap: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 12,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  termInput: {
    fontWeight: 'bold',
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDisabled: {
    backgroundColor: '#F3F4F6',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  imagePicker: {
    height: 180,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    marginTop: 4,
  },
  imagePickerActive: {
    borderStyle: 'solid',
    borderColor: '#F1F5F9',
  },
  pickerContent: {
    alignItems: 'center',
  },
  pickerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  pickedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  saveBtn: {
    flex: 2,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '70%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalList: {
    paddingBottom: 40,
  },
  resultItem: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  resultPartOfSpeech: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5B62E3',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  resultPhonetic: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultDef: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 4,
  },
  resultEx: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
