import React, { useState, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Image, Dimensions, ScrollView, PanResponder, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors, typography } from '../theme/colors';
import { flashcardApi } from '../api/flashcardApi';
import { API_BASE_URL } from '../api/apiClient';
import { WordResponse } from '../types/flashcard';
import { StudyCompletionOverlay } from '../components/StudyCompletionOverlay';
import { Toast } from '../components/shared/Toast';

const { width } = Dimensions.get('window');

type FlashcardStudyScreenProps = {
  onBack: () => void;
  setName: string;
  lessonId?: number;
  onlyDue?: boolean;
  isGlobal?: boolean;
};

export const FlashcardStudyScreen: React.FC<FlashcardStudyScreenProps> = ({ 
  onBack, 
  setName, 
  lessonId,
  onlyDue = false,
  isGlobal = false
}) => {
   const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const flipAnim = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.Value(0)).current;

  const [cards, setCards] = useState<WordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStudyComplete, setIsStudyComplete] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        let res;
        if (isGlobal) {
          res = await flashcardApi.getAllUserDueWords(0, 100);
        } else if (lessonId) {
          res = onlyDue 
            ? await flashcardApi.getDueWords(lessonId, 0, 100)
            : await flashcardApi.getLessonWords(lessonId, 0, 100);
        } else {
          return;
        }

        if (res.success && res.data.content) {
          if (res.data.content.length === 0 && (onlyDue || isGlobal)) {
            setToast({
              visible: true,
              message: isGlobal 
                ? 'Tuyệt vời! Bạn đã hoàn thành tất cả mục tiêu hôm nay. 🔥'
                : 'Tuyệt vời! Bạn không còn từ nào đến hạn học. 🔥',
              type: 'success'
            });
            setTimeout(() => {
              onBack();
            }, 2000);
          } else {
            setCards(res.data.content);
          }
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải từ vựng.');
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [lessonId, onlyDue, isGlobal]);

  const currentCard = cards.length > 0 ? cards[currentIndex % cards.length] : null;

  const handleFlip = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsFlipped(!isFlipped));
  };

  const swipeNext = () => {
    Animated.timing(pan, {
      toValue: -width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      handleNext();
      pan.setValue(width);
      Animated.spring(pan, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
  };

  const swipePrev = () => {
    Animated.timing(pan, {
      toValue: width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      handlePrev();
      pan.setValue(-width);
      Animated.spring(pan, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
  };

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -width * 0.2) {
          swipeNext();
        } else if (gestureState.dx > width * 0.2) {
          swipePrev();
        } else {
          Animated.spring(pan, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
    [cards, currentIndex, isFlipped] // Add dependencies here
  );

  const playSound = async () => {
    if (currentCard?.audioUrl) {
      try {
        const url = currentCard.audioUrl.startsWith('http') 
          ? currentCard.audioUrl 
          : `${API_BASE_URL}${currentCard.audioUrl.startsWith('/') ? '' : '/'}${currentCard.audioUrl}`;
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true }
        );
        
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch (error) {
        console.log('Error playing sound:', error);
      }
    } else {
      Alert.alert('Thông báo', 'Từ này không có âm thanh.');
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const handleReview = (difficulty: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
    if (currentCard) {
      flashcardApi.recordReview(currentCard.id, difficulty).catch(() => {});
    }
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex === cards.length - 1) {
      setIsStudyComplete(true);
      return;
    }

    if (isFlipped) {
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
    setCurrentIndex((prev: number) => cards.length > 0 ? (prev + 1) % cards.length : 0);
  };

  const handlePrev = () => {
    if (isFlipped) {
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
    setCurrentIndex((prev: number) => cards.length > 0 ? (prev - 1 + cards.length) % cards.length : 0);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#5B62E3" />
      </View>
    );
  }

  if (cards.length === 0 || !currentCard) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#6B7280', fontSize: 16, textAlign: 'center', paddingHorizontal: 40 }}>
          {onlyDue 
            ? 'Đã xử lý xong các từ đến hạn ôn tập. Đang quay lại...' 
            : 'Bộ thẻ này chưa có từ vựng nào.'}
        </Text>
        {!onlyDue && (
          <TouchableOpacity onPress={onBack} style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#EEF2FF', borderRadius: 12 }}>
            <Text style={{ color: '#4F46E5', fontWeight: 'bold' }}>Quay lại</Text>
          </TouchableOpacity>
        )}
        <Toast 
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast({ ...toast, visible: false })}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <View style={styles.streakBadge}>
          <MaterialCommunityIcons name="fire" size={16} color="#F97316" />
          <Text style={styles.streakText}>12 Ngày</Text>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.setName}>{setName}</Text>
        <View style={styles.progressHeader}>
          <Text style={styles.topicText}>Tiến độ</Text>
          <Text style={styles.progressCount}>
            <Text style={{ color: '#5B62E3', fontWeight: 'bold' }}>{currentIndex + 1}</Text>/{cards.length}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / cards.length) * 100}%` }]} />
        </View>
      </View>

      {/* Card Section */}
      <View style={styles.cardWrapper}>
        <Animated.View 
          style={[styles.cardContainer, { transform: [{ translateX: pan }] }]}
          {...panResponder.panHandlers}
        >
          {/* Front Card */}
          <Animated.View 
            style={[
              styles.card, 
              styles.cardFront, 
              frontAnimatedStyle, 
              { zIndex: isFlipped ? 0 : 1, pointerEvents: isFlipped ? 'none' : 'auto' }
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={handleFlip} style={styles.fullTouch}>
              <View style={[styles.cardImage, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                 {currentCard.imageUrl ? (
                   <Image 
                     source={{ uri: currentCard.imageUrl }} 
                     style={{ width: '100%', height: '100%' }} 
                     resizeMode="cover"
                   />
                 ) : (
                   <Ionicons name="image-outline" size={48} color="#D1D5DB" />
                 )}
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.termText}>{currentCard.name}</Text>
                <View style={styles.flipHint}>
                  <MaterialCommunityIcons name="gesture-tap" size={16} color="#9CA3AF" />
                  <Text style={styles.flipHintText}>Chạm để xem chi tiết</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Back Card */}
          <Animated.View 
            style={[
              styles.card, 
              styles.cardBack, 
              backAnimatedStyle, 
              { zIndex: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none' }
            ]}
          >
            <View style={styles.cardBackContent}>
              <TouchableOpacity onPress={handleFlip} style={styles.backHeader} activeOpacity={0.7}>
                <Text style={styles.backTerm}>{currentCard.name}</Text>
                <Text style={styles.backPhonetic}>{currentCard.ipa || ''}</Text>
                <MaterialCommunityIcons name="chevron-up" size={20} color="#D1D5DB" />
              </TouchableOpacity>
              
              <View style={styles.divider} />

              <ScrollView 
                showsVerticalScrollIndicator={true} 
                style={styles.backScroll}
                contentContainerStyle={styles.backScrollContent}
              >
                <Text style={styles.backDef}>{currentCard.definition}</Text>
                {currentCard.example ? (
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleText}>
                      "{currentCard.example}"
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              <TouchableOpacity style={styles.largeSoundBtn} onPress={playSound}>
                <Ionicons name="volume-high" size={32} color="#FFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Navigation and Choices */}
      <View style={styles.navigationRow}>
        <TouchableOpacity onPress={handlePrev} style={styles.navArrow}>
          <Ionicons name="chevron-back" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={styles.swipeHint}>VUỐT HOẶC CHẠM</Text>
        <TouchableOpacity onPress={handleNext} style={styles.navArrow}>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.choiceSection}>
        <View style={styles.choicesRow}>
          <TouchableOpacity style={styles.choiceBtn} onPress={() => handleReview('AGAIN')}>
            <View style={[styles.choiceIcon, { backgroundColor: '#FEF2F2' }]}>
              <MaterialCommunityIcons name="reload" size={28} color="#EF4444" />
            </View>
            <Text style={styles.choiceLabel}>AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.choiceBtn} onPress={() => handleReview('HARD')}>
            <View style={[styles.choiceIcon, { backgroundColor: '#FFF7ED' }]}>
              <MaterialCommunityIcons name="emoticon-confused-outline" size={28} color="#F97316" />
            </View>
            <Text style={styles.choiceLabel}>HARD</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.choiceBtn} onPress={() => handleReview('GOOD')}>
            <View style={[styles.choiceIcon, { backgroundColor: '#F0FDF4' }]}>
              <MaterialCommunityIcons name="emoticon-happy-outline" size={28} color="#22C55E" />
            </View>
            <Text style={styles.choiceLabel}>GOOD</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.choiceBtn} onPress={() => handleReview('EASY')}>
            <View style={[styles.choiceIcon, { backgroundColor: '#EFF6FF' }]}>
              <MaterialCommunityIcons name="emoticon-excited-outline" size={28} color="#3B82F6" />
            </View>
            <Text style={styles.choiceLabel}>EASY</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <StudyCompletionOverlay 
        isVisible={isStudyComplete} 
        onClose={onBack} 
      />

      <Toast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
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
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F97316',
    marginLeft: 4,
  },
  titleSection: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  setName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressCount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5B62E3',
    borderRadius: 3,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    marginVertical: 10,
  },
  cardContainer: {
    flex: 1,
  },
  fullTouch: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardFront: {
    // Normal state
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardImage: {
    width: '100%',
    height: '60%',
    backgroundColor: '#F3F4F6', // Placeholder color while loading
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  termText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.5,
  },
  flipHintText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  cardBackContent: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  backHeader: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 16,
  },
  backTerm: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  backPhonetic: {
    fontSize: 16,
    color: '#3B82F6',
    marginBottom: 8,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    marginBottom: 24,
  },
  backScroll: {
    flex: 1,
    width: '100%',
  },
  backScrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  backDef: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 20,
  },
  exampleBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    width: '100%',
  },
  exampleText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  largeSoundBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  navArrow: {
    padding: 10,
  },
  swipeHint: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D1D5DB',
    letterSpacing: 2,
  },
  choiceSection: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    paddingBottom: 32,
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  choiceBtn: {
    alignItems: 'center',
  },
  choiceIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  choiceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
});
