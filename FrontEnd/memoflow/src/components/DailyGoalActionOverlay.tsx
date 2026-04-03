import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type DailyGoalActionOverlayProps = {
  isVisible: boolean;
  onClose: () => void;
  onStudyFlashcard: () => void;
  onStudyApplied: () => void;
};

export const DailyGoalActionOverlay: React.FC<DailyGoalActionOverlayProps> = ({
  isVisible,
  onClose,
  onStudyFlashcard,
  onStudyApplied,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.handle} />
              <Text style={styles.title}>Chọn cách bạn muốn ôn tập</Text>

              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={[styles.actionBox, styles.flashcardBox]} 
                  onPress={onStudyFlashcard}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                    <MaterialCommunityIcons name="card-multiple" size={32} color="#5B62E3" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.actionTitle}>Học Flashcard</Text>
                    <Text style={styles.actionSubtitle}>Ôn tập qua thẻ ghi nhớ truyền thống</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#5B62E3" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBox, styles.appliedBox]} 
                  onPress={onStudyApplied}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
                    <MaterialCommunityIcons name="brain" size={32} color="#10B981" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.actionTitle}>Bài tập áp dụng</Text>
                    <Text style={styles.actionSubtitle}>Luyện tập qua các câu hỏi AI thông minh</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#10B981" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  actionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
  },
  flashcardBox: {
    backgroundColor: '#F5F7FF',
    borderColor: '#E0E7FF',
  },
  appliedBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
});
