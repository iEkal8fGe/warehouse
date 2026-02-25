import { api } from './index';

import type { User, CreateUserDto, UpdateUserDto } from '../types/users';

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    return api.get<User[]>('/users/');
  },

  getById: async (id: number): Promise<User> => {
    return api.get<User>(`/users/${id}`);
  },

  create: async (data: CreateUserDto): Promise<User> => {
    return api.post<User>('/users/', data);
  },

  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    return api.put<User>(`/users/${id}`, data);
  },

  updateStatus: async (id: number, is_active: boolean): Promise<User> => {
    return api.patch<User>('/users/status', { user_id: id, is_active });
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
