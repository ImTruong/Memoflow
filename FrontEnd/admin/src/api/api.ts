import axios from 'axios';

const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const adminApi = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  changeRole: async (userId: string, roleId: number) => {
    const response = await api.put(`/admin/users/${userId}/role?roleId=${roleId}`);
    return response.data;
  },
  changePassword: async (userId: string, newPassword: string) => {
    const response = await api.put(`/admin/users/${userId}/password?newPassword=${newPassword}`);
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  // Flashcard Management
  getFlashcards: async (page = 0, size = 10) => {
    const response = await api.get(`/admin/flashcard-lessons?page=${page}&size=${size}`);
    return response.data;
  },
  deleteFlashcard: async (id: string | number) => {
    const response = await api.delete(`/admin/flashcard-lessons/${id}`);
    return response.data;
  },
  getFlashcardWords: async (id: string | number) => {
    const response = await api.get(`/admin/flashcard-lessons/${id}`);
    return response.data;
  },
};

export default api;
