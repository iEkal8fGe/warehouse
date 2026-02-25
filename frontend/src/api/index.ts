import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ApiError {
  detail?: string;
  message?: string;
  statusCode?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // 10 секунд таймаут
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Интерцептор для добавления токена
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Интерцептор для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }

        // Форматируем ошибку для единообразия
        const apiError: ApiError = {
          detail: error.response?.data?.detail || error.message,
          statusCode: error.response?.status,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Типизированные методы
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Специальный метод для form-data (логин)
  async postForm<T>(url: string, data: URLSearchParams): Promise<T> {
    const response = await this.client.post<T>(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }
}

export const api = new ApiClient();

// // export api sources
// //export * from './auth';
// export * from './users';
//
// const API_BASE_URL = 'http://localhost:8000/api/v1';
//
// class ApiService {
//   private readonly baseURL: string;
//
//   constructor() {
//     this.baseURL = API_BASE_URL;
//   }
//
//   private getToken(): string | null {
//     return localStorage.getItem('access_token');
//   }
//
//   private setToken(token: string) {
//     localStorage.setItem('access_token', token);
//   }
//
//   private removeToken() {
//     localStorage.removeItem('access_token');
//   }
//
//   private async request(endpoint: string, options: RequestInit = {}, authRequired = true) {
//     const url = `${this.baseURL}${endpoint}`;
//     const headers: HeadersInit = {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     };
//
//     if (authRequired) {
//       const token = this.getToken();
//       if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//       }
//     }
//
//     const config: RequestInit = {
//       ...options,
//       headers,
//       credentials: 'include', // можно оставить для совместимости с cookies
//     };
//
//     const response = await fetch(url, config);
//
//     if (response.status === 401 && authRequired) {
//       this.removeToken();
//       throw new Error('Unauthorized');
//     }
//
//     return response;
//   }
//
//   async login(username: string, password: string) {
//     const formData = new URLSearchParams();
//     formData.append('username', username);
//     formData.append('password', password);
//
//     const response = await fetch(`${this.baseURL}/auth/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: formData,
//       credentials: 'include',
//     });
//
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.detail || 'Login failed');
//
//     if (data.access_token) this.setToken(data.access_token);
//     return data; // { user, access_token }
//   }
//
//   async getCurrentUser() {
//     try {
//       const response = await this.request('/auth/me', { method: 'GET' }, true);
//       if (!response.ok) return null;
//       return await response.json();
//     } catch {
//       return null;
//     }
//   }
//
//   async logout() {
//     this.removeToken();
//     await fetch(`${this.baseURL}/auth/logout`, { method: 'POST', credentials: 'include' });
//   }
//
//   // Пример для заказов
//   async getOrders() {
//     const response = await this.request('/orders/', { method: 'GET' });
//     return response.json();
//   }
// }
//
// export const index = new ApiService();