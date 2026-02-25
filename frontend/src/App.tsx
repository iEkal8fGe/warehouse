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

// Loading Screen
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

  // Не авторизован
  if (!user) return <Navigate to="/login" replace />;

  // Не админ
  if (!user.is_superuser) return <Navigate to="/employee" replace />;

  // Не активен
  if (!user.is_active) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

// Защищенный маршрут для сотрудников
const EmployeeRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  // Не авторизован
  if (!user) return <Navigate to="/login" replace />;

  // Админ - редирект в админку
  if (user.is_superuser) return <Navigate to="/admin" replace />;

  // Не активен
  if (!user.is_active) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

// Публичный маршрут (только для неавторизованных)
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  // Если уже авторизован - редирект в соответствующий раздел
  if (user) {
    return <Navigate to={user.is_superuser ? '/admin' : '/employee'} replace />;
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
        <Route index element={<AdminUsers />} />
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
        <Route path="dashboard" element={<EmployeeDashboard />} />
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


// const ProtectedRoute: React.FC<{
//   children: React.ReactNode;
//   requiredRole?: 'admin' | 'employee'
// }> = ({ children, requiredRole }) => {
//   const { user, loading } = useAuth();
//
//   if (loading) {
//     return <div>Loading...</div>;
//   }
//
//   if (!user) {
//     window.location.href = '/login';
//     return null;
//   }
//
//   if (requiredRole === 'admin' && !user.is_superuser) {
//     window.location.href = '/employee/dashboard';
//     return null;
//   }
//
//   if (requiredRole === 'employee' && user.is_superuser) {
//     window.location.href = '/admin/users';
//     return null;
//   }
//
//   return <>{children}</>;
// };
//
// function App() {
//   const path = window.location.pathname;
//
//   // Публичные маршруты
//   if (path === '/login') {
//     return <Login />;
//   }
//
//   // Защищенные маршруты
//   return (
//     <>
//       {/* Админские маршруты */}
//       {path.startsWith('/admin') && (
//         <ProtectedRoute requiredRole="admin">
//           <AdminLayout>
//             {path === '/admin/users' && <Users />}
//             {path === '/admin/warehouses' && <Warehouses />}
//             {path === '/admin/products' && <Products />}
//             {path === '/admin/orders' && <AdminOrders />}
//             {path === '/admin' && <Users />}
//           </AdminLayout>
//         </ProtectedRoute>
//       )}
//
//       {/* Employee маршруты */}
//       {path.startsWith('/employee') && (
//         <ProtectedRoute requiredRole="employee">
//           <EmployeeLayout>
//             {path === '/employee/dashboard' && <EmployeeDashboard />}
//             {path === '/employee/orders' && <EmployeeOrders />}
//             {path === '/employee/inventory' && <EmployeeInventory />}
//             {path === '/employee/supplies' && <Supplies />}
//             {path === '/employee' && <EmployeeDashboard />}
//           </EmployeeLayout>
//         </ProtectedRoute>
//       )}
//
//       {/* Редирект с корня */}
//       {path === '/' && (
//         <ProtectedRoute>
//           {null} {/* ProtectedRoute сам сделает редирект */}
//         </ProtectedRoute>
//       )}
//     </>
//   );
// }
//
// export default App;