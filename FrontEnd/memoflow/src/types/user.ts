import { ApiResponse } from './flashcard';

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  dateOfBirth?: string;

  avatar?: string;

  streakDays?: number;
};

export type UpdateUserProfileRequest = {
  name?: string;
  email?: string;
  dateOfBirth?: string;

  avatar?: any; // For multipart upload
};

export type UserResponse = UserProfile;
