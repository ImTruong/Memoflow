import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { FormInput } from '../components/shared/FormInput';

type ChangePasswordScreenProps = {
  onBack: () => void;
};

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ onBack }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScreenHeader
        title="Đổi mật khẩu"
        onBack={onBack}
        withTopMargin
        backIconName="chevron-back"
        backIconSize={28}
        filledBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Illustration or Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="lock-reset" size={40} color="#6366F1" />
          </View>
          <Text style={styles.infoText}>
            Mật khẩu mới của bạn nên có ít nhất 8 ký tự, bao gồm cả chữ cái và số để bảo mật tốt nhất.
          </Text>
        </View>

        {/* Input Fields – uses shared FormInput component */}
        <View style={styles.form}>
          <FormInput
            label="Mật khẩu hiện tại"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Nhập mật khẩu hiện tại"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showCurrentPassword}
            rightIcon={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
          />
          <FormInput
            label="Mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nhập mật khẩu mới"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showNewPassword}
            rightIcon={showNewPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowNewPassword(!showNewPassword)}
          />
          <FormInput
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showConfirmPassword}
            rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Cập nhật mật khẩu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 32,
  },
  buttonGroup: {
    gap: 12,
  },
  saveBtn: {
    backgroundColor: '#6366F1',
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#F5F7FF',
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#6366F1',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
