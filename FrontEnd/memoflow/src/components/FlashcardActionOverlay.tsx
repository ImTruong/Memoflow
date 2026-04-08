import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Animated } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type FlashcardActionOverlayProps = {
  isVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLearnAll: () => void;
  onLearnDue: () => void;
  onGame: () => void;
  isOwner?: boolean; // New prop to check ownership
};

export const FlashcardActionOverlay: React.FC<FlashcardActionOverlayProps> = ({
  isVisible,
  onClose,
  onEdit,
  onDelete,
  onLearnAll,
  onLearnDue,
  onGame,
  isOwner = true, // Default to true for backward compatibility
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
              <Text style={styles.title}>Tùy chọn hành động</Text>

              <View style={styles.grid}>
                <TouchableOpacity style={[styles.actionBox, styles.learnAllBox]} onPress={onLearnAll}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="school" size={32} color="#5B62E3" />
                  </View>
                  <Text style={[styles.actionText, { color: '#5B62E3' }]}>Học tất cả</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBox, styles.learnDueBox]} onPress={onLearnDue}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="calendar-check" size={32} color="#F97316" />
                  </View>
                  <Text style={[styles.actionText, { color: '#F97316' }]}>Học từ đến hạn</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBox, styles.gameBox]} onPress={onGame}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="gamepad-variant" size={32} color="#10B981" />
                  </View>
                  <Text style={[styles.actionText, { color: '#10B981' }]}>Game điền từ</Text>
                </TouchableOpacity>

                {/* Show "Xem chi tiết" for non-owners, "Sửa bộ từ" for owners */}
                <TouchableOpacity style={[styles.actionBox, styles.editBox]} onPress={onEdit}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons 
                      name={isOwner ? "pencil" : "eye-outline"} 
                      size={32} 
                      color="#4B5563" 
                    />
                  </View>
                  <Text style={[styles.actionText, { color: '#4B5563' }]}>
                    {isOwner ? "Sửa bộ từ" : "Xem chi tiết"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Only show delete button for owners */}
              {isOwner && (
                <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                  <MaterialCommunityIcons name="trash-can-outline" size={24} color="#EF4444" />
                  <Text style={styles.deleteText}>Xoá bộ từ</Text>
                </TouchableOpacity>
              )}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBox: {
    width: '48%',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  learnAllBox: {
    backgroundColor: '#EEF2FF',
  },
  learnDueBox: {
    backgroundColor: '#FFF7ED',
  },
  gameBox: {
    backgroundColor: '#ECFDF5',
  },
  editBox: {
    backgroundColor: '#F9FAFB',
  },
  deleteBtn: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
