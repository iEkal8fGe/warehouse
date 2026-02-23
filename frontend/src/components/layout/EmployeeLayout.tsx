import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  User,
  Menu,
  X,
  Settings,
  LogOut
} from 'lucide-react';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export const EmployeeLayout: React.FC<EmployeeLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/employee/orders', icon: ShoppingCart },
    { name: 'Inventory', href: '/employee/inventory', icon: Package },
    { name: 'Supplies', href: '/employee/supplies', icon: Truck },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <div className="employee-layout">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Package size={24} />
            <span>Warehouse</span>
          </div>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`nav-item ${window.location.pathname === item.href ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <a href="/employee/settings" className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </a>
          <button onClick={handleLogout} className="nav-item">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="page-title">
              {navigation.find(item => item.href === window.location.pathname)?.name || 'Dashboard'}
            </div>
          </div>

          <div className="header-right">
            {/* User menu */}
            <div className="user-menu-container">
              <button
                className="user-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <span className="user-name">John Doe</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="content">
          {children}
        </div>
      </main>

      <style>{`
        .employee-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 260px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: transform 0.3s ease;
        }

        .sidebar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 999;
        }

        .sidebar-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #333;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .close-sidebar {
          display: none;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
        }

        .close-sidebar:hover {
          background: rgba(0, 0, 0, 0.05);
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
          color: #666;
          text-decoration: none;
          transition: all 0.3s;
        }

        .nav-item:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .nav-item.active {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
          color: #667eea;
          border-left: 3px solid #667eea;
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        /* Main content */
        .main-content {
          margin-left: 260px;
          min-height: 100vh;
        }

        /* Header */
        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .menu-btn {
          display: none;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
        }

        .menu-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        /* User menu */
        .user-menu-container {
          position: relative;
        }

        .user-menu-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 40px;
          transition: background 0.3s;
        }

        .user-menu-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-name {
          color: #333;
          font-weight: 500;
        }

        .arrow {
          color: #999;
          transition: transform 0.3s;
        }

        .arrow.open {
          transform: rotate(180deg);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 200px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          z-index: 1000;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: #333;
          text-decoration: none;
          transition: background 0.3s;
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background: #f3f4f6;
        }

        .dropdown-item.logout {
          color: #ef4444;
        }

        .dropdown-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 8px 0;
        }

        /* Content */
        .content {
          padding: 32px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .close-sidebar {
            display: block;
          }

          .main-content {
            margin-left: 0;
          }

          .menu-btn {
            display: block;
          }

          .page-title {
            font-size: 1.2rem;
          }

          .user-name {
            display: none;
          }

          .notifications-dropdown {
            position: fixed;
            top: auto;
            right: 16px;
            left: 16px;
            width: auto;
          }
        }
        
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
          margin-bottom: 16px;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
          z-index: 1;
        }

        .search-input input {
          padding-left: 40px;
        }
        /* End Search and filters */
        
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
        
        /* Card styles */
        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius);
          padding: 20px;
          transition: all 0.3s;
        }
        
        .stat-card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }
        
        /* Filter toggle */
        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-weight: 500;
          width: 100%;
        }
        
        .filter-toggle .arrow {
          margin-left: auto;
          transition: transform 0.3s;
        }
        
        .filter-toggle .arrow.open {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
};