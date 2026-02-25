export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role?: 'admin' | 'employee';
}

// export interface AuthState {
//   user: User | null
//   isLoading: boolean
//   isAuthenticated: boolean
// }