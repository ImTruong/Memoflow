import { apiFetch } from './apiClient';
import { ApiResponse } from '../types/flashcard';

export const authApi = {
  login: async (data: { email: string; password: string }) => {
    return apiFetch<ApiResponse<{ token: string }>>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  loginGoogle: async (data: { token: string }) => {
    return apiFetch<ApiResponse<{ token: string }>>('/auth/login-google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  loginFacebook: async (data: { token: string }) => {
    console.log(data.token);
    return apiFetch<ApiResponse<{ token: string }>>('/auth/login-facebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  register: async (data: { name: string; email: string; password: string }) => {
    return apiFetch<ApiResponse<any>>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  verifyAccount: async (data: { email: string; password: string; code: string }) => {
    return apiFetch<ApiResponse<{ token: string }>>('/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  forgotPassword: async (data: { email: string; newPassword: string }) => {
    return apiFetch<ApiResponse<any>>('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  verifyResetPassword: async (data: { email: string; code: string }) => {
    return apiFetch<ApiResponse<any>>('/auth/verify-reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

};