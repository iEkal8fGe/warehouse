import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Экспортируем функции по отдельности
export const login = (username: string, password: string) => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  return api.post('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export const getMe = () => {
  return api.get('/auth/me');
};

// ИЛИ экспортируем как объект (выбирай один стиль)
export const authAPI = {
  login,
  getMe,
};

export default api;