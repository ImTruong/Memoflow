import { useState, useCallback, useEffect } from 'react';
import { UserProfile, UpdateUserProfileRequest } from '../types/user';
import { userApi } from '../api/userApi';

export const useUser = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.getProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin cá nhân');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = async (data: UpdateUserProfileRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.updateProfile(data);
      if (response.success) {
        setProfile(response.data);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refreshProfile: fetchProfile,
    updateProfile,
  };
};
