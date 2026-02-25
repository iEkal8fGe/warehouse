import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../api/auth';
import type { User } from '../types/users';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    };

    // Загружаем пользователя только если есть токен
    if (localStorage.getItem('access_token')) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login(username, password);

      // После логина сразу загружаем пользователя
      const userData = await authAPI.getCurrentUser();
      setUser(userData);

      // Редирект на основе роли из ответа (опционально)
      if (response.role === 'admin') {
        window.location.href = '/admin/users';
      } else {
        window.location.href = '/employee/dashboard';
      }
    } catch (error: any) {
      throw new Error(error.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { index } from '../api';
// import type { User } from '../types';
//
// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (username: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
// }
//
// const AuthContext = createContext<AuthContextType | undefined>(undefined);
//
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const userData = await index.getCurrentUser();
//         setUser(userData);
//       } catch (error) {
//         console.error('Failed to load user', error);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadUser();
//   }, []);
//
//   const login = async (username: string, password: string) => {
//     setLoading(true);
//     try {
//       const data = await index.login(username, password);
//       setUser(data.user);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const logout = async () => {
//     setLoading(true);
//     try {
//       await index.logout();
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
//
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };