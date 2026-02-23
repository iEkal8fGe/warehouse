import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Intercept for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept for handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Неавторизован - удаляем токен и редирект на логин
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// - - - - - - - - API METHODS - - - - - - - - //
// - - - [Auth] Methods - - -
export const authAPI = {
  login: (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
};
// - - - [End Auth] Methods - - -

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// - - - [User/Employee] Methods - - -
export const getMe = () => {
  return api.get('/auth/me');
};

export const usersAPI = {
  getMe: () => api.get('/users/me'),
  // TODO: Other methods
};
// - - - [End User/Employee] Methods - - -

// - - - - - - - - END API METHODS - - - - - - - -

export default api;