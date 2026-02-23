import React from 'react';
import {
  Users, Package, MapPin, ShoppingCart,
  Home, LogOut, Menu, ChevronLeft, User
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/warehouses', icon: MapPin, label: 'Warehouses' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            {!collapsed && <span>Warehouse System</span>}
          </div>
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`nav-item ${window.location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <Menu size={24} />
      </button>

      {/* Mobile sidebar */}
      {showMobileMenu && (
        <aside className="mobile-sidebar">
          <div className="mobile-sidebar-header">
            <h2>Warehouse MS</h2>
            <button onClick={() => setShowMobileMenu(false)}>×</button>
          </div>
          <nav className="mobile-sidebar-nav">
            {menuItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="mobile-nav-item"
                onClick={() => setShowMobileMenu(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            ))}
            <button className="mobile-logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Выйти</span>
            </button>
          </nav>
        </aside>
      )}

      {/* Main content */}
      <main className={`main-content ${collapsed ? 'expanded' : ''}`}>
        <header className="main-header">
          <div className="header-left">
            <h1>Admin</h1>
          </div>
          <div className="header-right">
            <div className="user-menu">
              <User size={20} />
              <span>Admin</span>
            </div>
          </div>
        </header>

        <div className="content">
          {children}
        </div>
      </main>

      <style>{`
        .admin-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 260px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          transition: width 0.3s ease;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }
        .sidebar.collapsed {
          width: 80px;
        }
        .sidebar-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        .logo {
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .collapse-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: var(--transition);
        }
        .collapse-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .sidebar-nav {
          flex: 1;
          padding: 24px 0;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: var(--transition);
        }
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .nav-item.active {
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%);
          color: white;
          border-left: 3px solid var(--primary);
        }
        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        .logout-btn {
          width: 100%;
          padding: 12px;
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-sm);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: var(--transition);
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: var(--danger);
          color: white;
        }
        .main-content {
          margin-left: 260px;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
        }
        .main-content.expanded {
          margin-left: 80px;
        }
        .main-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-left h1 {
          color: white;
          margin: 0;
          font-size: 1.5rem;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .user-menu {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          color: white;
          cursor: pointer;
          transition: var(--transition);
        }
        .user-menu:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .content {
          padding: 32px;
        }
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 10px;
          border-radius: 50%;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }
        .mobile-sidebar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          z-index: 2000;
          padding: 20px;
        }
        .mobile-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          color: white;
        }
        .mobile-sidebar-header button {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
        }
        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          color: white;
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .mobile-logout-btn {
          width: 100%;
          padding: 16px;
          margin-top: 40px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid var(--danger);
          border-radius: var(--radius-sm);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
          .main-content {
            margin-left: 0 !important;
          }
          .mobile-menu-btn {
            display: block;
          }
          .mobile-sidebar {
            display: block;
          }
        }
        
        
        /* 
        Mutual selectors style
        For any admin page
        */
        
        
        /* Page headers */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .page-header h2 {
          color: white;
          margin: 0;
        }
        /* End page headers */
        
        
        /* Search and filters */
        .filters-card {
          padding: 16px;
        }
        .filters {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .search-wrapper {
          position: relative;
          flex: 1;
        }
        .search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
          z-index: 1;
        }
        .search-input input {
          padding-left: 40px;
        }
        /* End Search and filters */
        
        
        /* Select fields */
        .select {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-sm);
          color: white;
          font-size: 1rem;
        }
        .select option {
          background: #333;
        }
        .select option:checked {
          background: var(--primary);
        }
        /* End Select field */
        
        
        /* Badges */
        .badge {
          display: inline-block;
          min-width: 80px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          text-align: center;
          white-space: nowrap;
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid #10b981;
        }
        .badge-danger {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid #ef4444;
        }
        .badge-info {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: 1px solid #3b82f6;
        }

        .badge-warning {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid #f59e0b;
        }
        /* End Badges */
        
        
      `}</style>
    </div>
  );
};