// frontend/src/services/api.ts
const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    return data; // { user: { id, username, role, warehouse_id } }
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      credentials: 'include',
    });

    if (response.status === 401) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to get user');
    }

    return data;
  }

  async logout() {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return true;
  }
}

export const api = new ApiService();