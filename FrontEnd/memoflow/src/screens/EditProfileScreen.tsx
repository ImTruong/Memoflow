import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { useUser } from '../hooks/useUser';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Toast } from '../components/shared/Toast';
import { FormInput } from '../components/shared/FormInput';

const { width } = Dimensions.get('window');

type EditProfileScreenProps = {
  onBack: () => void;
};

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack }) => {
  const { profile, updateProfile, isLoading } = useUser();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(""); 
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/300?img=11');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success'|'error' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  // Sync state when profile is loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setDateOfBirth(profile.dateOfBirth || "");
      if (profile.avatar) {
        setAvatar(profile.avatar);
      }
    }
  }, [profile]);

  const handleSave = async () => {
    const success = await updateProfile({
      name,
      email,
      dateOfBirth,
      avatar: avatar.startsWith('http') ? undefined : avatar
    });
    
    if (success) {
      setToast({
        visible: true,
        message: 'Thông tin cá nhân đã được cập nhật thành công!',
        type: 'success'
      });
      
      // Delay back for user to see toast
      setTimeout(() => {
        onBack();
      }, 2000);
    } else {
      setToast({
        visible: true,
        message: 'Cập nhật thất bại. Vui lòng thử lại!',
        type: 'error'
      });
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDateOfBirth(`${year}-${month}-${day}`);
    }
  };

  const getInitialDate = () => {
    try {
      if (dateOfBirth) return new Date(dateOfBirth);
    } catch(e) {}
    return new Date();
  };


  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Xin lỗi, chúng tôi cần quyền truy cập ảnh để đổi avatar!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onHide={() => setToast({ ...toast, visible: false })} 
      />

      <ScreenHeader

        title="Sửa thông tin cá nhân"
        onBack={onBack}
        withTopMargin
        backIconName="chevron-back"
        backIconSize={28}
        filledBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={styles.editAvatarBtn}>
              <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changePhotoTextBtn} onPress={pickImage}>
            <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <FormInput
            label="Họ và tên"
            value={name}
            onChangeText={setName}
            placeholder="Nhập họ và tên"
            placeholderTextColor="#94A3B8"
          />
          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormInput
            label="Ngày sinh"
            value={dateOfBirth || ''}
            placeholder="Chọn ngày sinh"
            placeholderTextColor="#94A3B8"
            onPress={() => setShowDatePicker(true)}
            rightIcon="calendar-outline"
            editable={false}
          />

          {showDatePicker && (
            <DateTimePicker
              value={getInitialDate()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.saveBtn, isLoading && { opacity: 0.7 }]} 
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
            )}
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
    paddingTop: 30,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 5,
    backgroundColor: '#FFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  changePhotoTextBtn: {
    marginTop: 16,
  },
  changePhotoText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    height: 60,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  inputIcon: {
    marginLeft: 10,
  },
  buttonGroup: {
    gap: 12,
  },
  saveBtn: {
    backgroundColor: '#3B82F6',
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
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
    backgroundColor: '#EFF6FF',
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
