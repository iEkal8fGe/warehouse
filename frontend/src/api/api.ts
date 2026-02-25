const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  private removeToken() {
    localStorage.removeItem('access_token');
  }

  private async request(endpoint: string, options: RequestInit = {}, authRequired = true) {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (authRequired) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // можно оставить для совместимости с cookies
    };

    const response = await fetch(url, config);

    if (response.status === 401 && authRequired) {
      this.removeToken();
      throw new Error('Unauthorized');
    }

    return response;
  }

  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Login failed');

    if (data.access_token) this.setToken(data.access_token);
    return data; // { user, access_token }
  }

  async getCurrentUser() {
    try {
      const response = await this.request('/auth/me', { method: 'GET' }, true);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async logout() {
    this.removeToken();
    await fetch(`${this.baseURL}/auth/logout`, { method: 'POST', credentials: 'include' });
  }

  // Пример для заказов
  async getOrders() {
    const response = await this.request('/orders/', { method: 'GET' });
    return response.json();
  }
}

export const api = new ApiService();