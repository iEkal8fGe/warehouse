import React from 'react';

import Login from './pages/Login';

import { AdminLayout } from './components/layout/AdminLayout';
import { EmployeeLayout } from "./components/layout/EmployeeLayout.tsx";

{/* Import admin pages*/}
import Users from './pages/admin/Users';
import Warehouses from "./pages/admin/Warehouses.tsx";
import Products from "./pages/admin/Products.tsx";
import Orders from './pages/admin/Orders';

{/* Import employee pages */}
import EmployeeOrders from "./pages/employee/Orders.tsx";
import EmployeeInventory from "./pages/employee/Inventory.tsx"
import Supplies from './pages/employee/Supplies';
import EmployeeDashboard from './pages/employee/Dashboard.tsx';
import {LogOut} from "lucide-react";

function App() {
  const path = window.location.pathname;
  const token = localStorage.getItem('token');

  const handleLogin = (token: string) => { //, role: 'admin' | 'employee') => {
    localStorage.setItem('token', token);
    window.location.href = '/admin';
    // localStorage.setItem('role', role);

    // if (role === 'admin') {
    //   window.location.href = '/admin';
    // } else {
    //   window.location.href = '/employee';
    // }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    // localStorage.removeItem('role');  // Добавь удаление роли
    window.location.href = '/login';
  };

  // Если нет токена и не на логине - редирект
  if (!token && path !== '/login') {
    window.location.href = '/login';
    return null;
  }

  const role = localStorage.getItem('role') as 'admin' | 'employee' | null;

  // Если есть токен и на логине - редирект по роли
  if (token && path === '/login') {
    window.location.href = role === 'admin' ? '/admin' : '/employee';
    return null;
  }

  // Для защиты админских роутов
  if (path.startsWith('/admin') && role !== 'admin') {
    window.location.href = '/employee';
    return null;
  }

  // Для защиты employee роутов
  if (path.startsWith('/employee') && role !== 'employee') {
    window.location.href = '/admin';
    return null;
  }

  // Роутинг
  if (path === '/login') {
    return <Login onLogin={handleLogin} />;
  }

  if (path.startsWith('/admin')) {
    return (
      <AdminLayout>
        {/* TODO: Add dashboard route */}
        {path === '/admin/users' && <Users />}
        {path === '/admin/warehouses' && <Warehouses />}
        {path === '/admin/products' && <Products />}
        {path === '/admin/orders' && <Orders />}
      </AdminLayout>
    );
  }

  if (path.startsWith('/employee')) {
    return (
    <EmployeeLayout>
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