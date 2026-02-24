import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminWarehouses from './pages/admin/Warehouses';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeOrders from './pages/employee/Orders';
import EmployeeInventory from './pages/employee/Inventory';
import EmployeeSupplies from './pages/employee/Supplies';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import EmployeeLayout from './components/layout/EmployeeLayout';

// Защищенный маршрут для админов
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/employee" />;

  return children;
};

// Защищенный маршрут для сотрудников
const EmployeeRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'employee') return <Navigate to="/admin" />;

  return children;
};

// Публичный маршрут (только для неавторизованных)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
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
        <Route index element={<div>Admin Dashboard</div>} /> {/* Добавьте это */}
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

      {/* Редирект на главную если маршрут не найден */}
      <Route path="*" element={<Navigate to="/login" />} />
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