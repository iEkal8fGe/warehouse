import React, { useEffect, useState } from 'react';
import Login from './pages/Login';
import { AdminLayout } from './components/layout/AdminLayout';
import { EmployeeLayout } from "./components/layout/EmployeeLayout.tsx";

{/* Import admin pages */}
import Users from './pages/admin/Users';
import Warehouses from "./pages/admin/Warehouses.tsx";
import Products from "./pages/admin/Products.tsx";
import Orders from './pages/admin/Orders';

{/* Import employee pages */}
import EmployeeOrders from "./pages/employee/Orders.tsx";
import EmployeeInventory from "./pages/employee/Inventory.tsx"
import Supplies from './pages/employee/Supplies';
import EmployeeDashboard from './pages/employee/Dashboard.tsx';

import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const path = window.location.pathname;

  // Функция для проверки токена на бекенде
  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return userData;
      } else {
        localStorage.removeItem('token');
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Проверяем токен при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (token: string, role: 'admin' | 'employee') => {
    try {
      localStorage.setItem('token', token);

      await verifyToken(token);

      // Редирект based on user role from backend
      if (role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/employee/dashboard';
      }
    } catch (error) {
      console.error('Login handling error:', error);
      // В случае ошибки при верификации, удаляем токен
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };


  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  if (!user && path !== '/login') {
    window.location.href = '/login';
    return null;
  }

  if (user && path === '/login') {
    window.location.href = user.role === 'admin' ? '/admin' : '/employee/dashboard';
    return null;
  }

  if (path.startsWith('/admin') && (!user || user.role !== 'admin')) {
    window.location.href = '/employee/dashboard';
    return null;
  }

  if (path.startsWith('/employee') && (!user || user.role !== 'employee')) {
    window.location.href = '/admin';
    return null;
  }

  if (path === '/login') {
    return <Login onLogin={handleLogin} />;
  }

  if (path.startsWith('/admin')) {
    return (
      <AdminLayout user={user} onLogout={handleLogout}>
        {path === '/admin/users' && <Users />}
        {path === '/admin/warehouses' && <Warehouses />}
        {path === '/admin/products' && <Products />}
        {path === '/admin/orders' && <Orders />}
        {/* Добавьте dashboard когда будет готов */}
        {path === '/admin' && <div>Admin Dashboard</div>}
      </AdminLayout>
    );
  }

  if (path.startsWith('/employee')) {
    return (
      <EmployeeLayout user={user} onLogout={handleLogout}>
        {path === '/employee/dashboard' && <EmployeeDashboard />}
        {path === '/employee/orders' && <EmployeeOrders />}
        {path === '/employee/inventory' && <EmployeeInventory />}
        {path === '/employee/supplies' && <Supplies />}
      </EmployeeLayout>
    );
  }

  return <div>404 - Page Not Found</div>;
}

export default App;