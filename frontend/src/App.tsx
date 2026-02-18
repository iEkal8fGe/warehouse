//import React from 'react';
import Login from './pages/Login';
import { AdminLayout } from './components/layout/AdminLayout';
import Users from './pages/admin/Users';

function App() {
  const path = window.location.pathname;
  const token = localStorage.getItem('token');

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token);
    window.location.href = '/admin';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Если нет токена и не на логине - редирект
  if (!token && path !== '/login') {
    window.location.href = '/login';
    return null;
  }

  // Если есть токен и на логине - редирект в админку
  if (token && path === '/login') {
    window.location.href = '/admin';
    return null;
  }

  // Роутинг
  if (path === '/login') {
    return <Login onLogin={handleLogin} />;
  }

  if (path === '/logout') {
    return <Login onLogin={handleLogout} />;
  }

  if (path.startsWith('/admin')) {
    return (
      <AdminLayout>
        {path === '/admin/users' && <Users />}
        {/* Другие страницы добавим позже */}
      </AdminLayout>
    );
  }

  return <div>404</div>;
}

export default App;