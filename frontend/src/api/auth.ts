import { api } from "./index";

import type { LoginResponse } from "../types/auth";
import type { User } from "../types/users";

export const authAPI = {
  // Логин с form-data
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.postForm<LoginResponse>('/auth/login', formData);

    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }

    return response;
  },

  // Получить текущего пользователя
  getCurrentUser: async (): Promise<User | null> => {
    try {
      return await api.get<User>('/auth/me');
    } catch {
      return null;
    }
  },

  // Выход
  logout: async (): Promise<void> => {
    localStorage.removeItem('access_token');
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Игнорируем ошибки при логауте
    }
  },
};
