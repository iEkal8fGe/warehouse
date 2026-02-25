import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import EmployeeLayout from './components/layout/EmployeeLayout';

// Pages
import Login from './pages/Login';

// Admin
import AdminUsers from './pages/admin/Users';
import AdminWarehouses from './pages/admin/Warehouses';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';

// Employee
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeOrders from './pages/employee/Orders';
import EmployeeInventory from './pages/employee/Inventory';
import EmployeeSupplies from './pages/employee/Supplies';

// Компонент загрузки
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '1.2rem'
  }}>
    Loading...
  </div>
);

// Защищенный маршрут для админов
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/employee" replace />;

  return <>{children}</>;
};

// Защищенный маршрут для сотрудников
const EmployeeRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'employee') return <Navigate to="/admin" replace />;

  return <>{children}</>;
};

// Публичный маршрут (только для неавторизованных)
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Редиректы */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Публичные маршруты */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      {/* Админские маршруты */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<div>Admin Dashboard</div>} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="warehouses" element={<AdminWarehouses />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* Маршруты сотрудников */}
      <Route path="/employee" element={
        <EmployeeRoute>
          <EmployeeLayout />
        </EmployeeRoute>
      }>
        <Route index element={<EmployeeDashboard />} />
        <Route path="orders" element={<EmployeeOrders />} />
        <Route path="inventory" element={<EmployeeInventory />} />
        <Route path="supplies" element={<EmployeeSupplies />} />
      </Route>

      {/* 404 - редирект на логин */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;