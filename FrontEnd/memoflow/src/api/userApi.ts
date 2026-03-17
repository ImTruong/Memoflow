import { Platform } from 'react-native';
import { apiFetch } from './apiClient';
import { ApiResponse } from '../types/flashcard';
import { UserResponse, UpdateUserProfileRequest } from '../types/user';

export const userApi = {
  getProfile: () => 
    apiFetch<ApiResponse<UserResponse>>('/users/profile'),

  updateProfile: async (data: UpdateUserProfileRequest) => {
    console.log("Đang bắt đầu updateProfile...", { 
      name: data.name, 
      platform: Platform.OS, 
      hasAvatar: !!data.avatar 
    });

    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth);

    if (data.avatar) {
      if (Platform.OS === 'web') {
        // On Web, we need to convert URI to a blob
        if (data.avatar.startsWith('blob:') || data.avatar.startsWith('data:')) {
          try {
            const response = await fetch(data.avatar);
            const blob = await response.blob();
            formData.append('avatar', blob, 'avatar.jpg');
            console.log("Đã append avatar dưới dạng Blob (Web)");
          } catch (e) {
            console.error("Lỗi chuyển đổi ảnh trên Web:", e);
          }
        } else {
          console.warn("Avatar URI không phải blob/data trên Web:", data.avatar);
        }
      } else {
        // Mobile behavior: React Native expects an object with uri, name, and type
        formData.append('avatar', {
          uri: data.avatar,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);
        console.log("Đã append avatar dưới dạng RN Object (Mobile)");
      }
    }

    return apiFetch<ApiResponse<UserResponse>>('/users/profile', {
      method: 'PUT',
      body: formData,
    });
  },
};
