import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Truck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

// Mock data (можно потом заменить на реальные API запросы)
const mockStats = {
  totalOrders: 156,
  pendingOrders: 23,
  shippedOrders: 89,
  deliveredOrders: 44,
  totalProducts: 1247,
  lowStockProducts: 8,
  outOfStockProducts: 3,
  recentSupplies: 12,
};

const mockRecentActivities = [
  { id: 1, type: 'order', action: 'New order #ORD-2026-0042', time: '5 minutes ago', status: 'new' },
  { id: 2, type: 'supply', action: 'Supply #SUP-2026-0085 completed', time: '1 hour ago', status: 'success' },
  { id: 3, type: 'inventory', action: 'Low stock alert: Dell XPS 13', time: '2 hours ago', status: 'warning' },
  { id: 4, type: 'order', action: 'Order #ORD-2026-0038 shipped', time: '3 hours ago', status: 'shipped' },
  { id: 5, type: 'inventory', action: 'Out of stock: RTX 3060', time: '5 hours ago', status: 'danger' },
  { id: 6, type: 'supply', action: 'New supply created #SUP-2026-0086', time: '6 hours ago', status: 'info' },
];

const mockTopProducts = [
  { id: 1, name: 'Dell XPS 13 Laptop', sales: 45, stock: 15 },
  { id: 2, name: 'Samsung 27" Monitor', sales: 32, stock: 8 },
  { id: 3, name: 'Logitech MX Keys', sales: 28, stock: 23 },
  { id: 4, name: 'Samsung 1TB SSD', sales: 25, stock: 42 },
  { id: 5, name: 'Logitech MX Master 3', sales: 21, stock: 17 },
];

const mockRecentOrders = [
  { id: 1, number: 'ORD-2026-0042', customer: 'John Smith', amount: 1250, status: 'new' },
  { id: 2, number: 'ORD-2026-0041', customer: 'Emma Wilson', amount: 890, status: 'shipped' },
  { id: 3, number: 'ORD-2026-0040', customer: 'Michael Brown', amount: 3299, status: 'delivered' },
  { id: 4, number: 'ORD-2026-0039', customer: 'Sarah Davis', amount: 1560, status: 'processing' },
  { id: 5, number: 'ORD-2026-0038', customer: 'Robert Taylor', amount: 430, status: 'delivered' },
];

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'new': return <Clock size={14} color="#3b82f6" />;
      case 'shipped': return <Truck size={14} color="#8b5cf6" />;
      case 'delivered': return <CheckCircle size={14} color="#10b981" />;
      case 'warning': return <AlertTriangle size={14} color="#f59e0b" />;
      case 'danger': return <XCircle size={14} color="#ef4444" />;
      case 'success': return <CheckCircle size={14} color="#10b981" />;
      case 'info': return <Package size={14} color="#3b82f6" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'new': 'badge-info',
      'shipped': 'badge-primary',
      'delivered': 'badge-success',
      'processing': 'badge-warning',
      'cancelled': 'badge-danger'
    };
    return styles[status as keyof typeof styles] || 'badge-secondary';
  };

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, John!</h1>
          <p className="time">{currentTime.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <Card className="kpi-card">
          <div className="kpi-icon blue">
            <ShoppingCart size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Orders</span>
            <span className="kpi-value">{mockStats.totalOrders}</span>
            <div className="kpi-footer">
              <span className="kpi-sub">{mockStats.pendingOrders} pending</span>
              <span className="kpi-sub">{mockStats.shippedOrders} shipped</span>
            </div>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-icon green">
            <Package size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Inventory</span>
            <span className="kpi-value">{mockStats.totalProducts}</span>
            <div className="kpi-footer">
              <span className="kpi-sub warning">{mockStats.lowStockProducts} low stock</span>
              <span className="kpi-sub danger">{mockStats.outOfStockProducts} out</span>
            </div>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-icon purple">
            <Truck size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Supplies</span>
            <span className="kpi-value">{mockStats.recentSupplies}</span>
            <div className="kpi-footer">
              <span className="kpi-sub">this month</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Tables Grid */}
      <div className="dashboard-grid">
        {/* Recent Activities */}
        <Card className="recent-activities">
          <div className="card-header">
            <h3>Recent Activities</h3>
            <button className="view-all">View all</button>
          </div>
          <div className="activities-list">
            {mockRecentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon ${activity.status}`}>
                  {getStatusIcon(activity.status)}
                </div>
                <div className="activity-content">
                  <p className="activity-text">{activity.action}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="top-products">
          <div className="card-header">
            <h3>Top Products</h3>
            <button className="view-all">View all</button>
          </div>
          <div className="products-list">
            {mockTopProducts.map(product => (
              <div key={product.id} className="product-item">
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <div className="product-stats">
                    <span className="stock-badge" title="Current stock">
                      <Package size={12} /> {product.stock}
                    </span>
                  </div>
                </div>
                <div className="product-metrics">
                  <div className="metric">
                    <span className="metric-label">Sales</span>
                    <span className="metric-value">{product.sales}</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(product.sales / 50) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="recent-orders full-width">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <button className="view-all">View all</button>
          </div>
          <div className="orders-table-mini">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockRecentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.number}</td>
                    <td>{order.customer}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .dashboard-header h1 {
          margin: 0 0 4px 0;
          font-size: 2rem;
        }

        .dashboard-header .time {
          margin: 0;
          opacity: 0.7;
          font-size: 0.9rem;
        }

        .header-stats {
          display: flex;
          gap: 12px;
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .kpi-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }

        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-icon.blue {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .kpi-icon.green {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .kpi-icon.purple {
          background: rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
        }

        .kpi-icon.gold {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .kpi-content {
          flex: 1;
        }

        .kpi-label {
          display: block;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 4px;
        }

        .kpi-value {
          display: block;
          font-size: 1.8rem;
          font-weight: 600;
          color: white;
          line-height: 1.2;
        }

        .kpi-footer {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .kpi-sub {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .kpi-sub.warning {
          color: #f59e0b;
        }

        .kpi-sub.danger {
          color: #ef4444;
        }

        .kpi-sub.success {
          color: #10b981;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .card-header h3 {
          margin: 0;
          color: white;
          font-size: 1.1rem;
        }

        .view-all {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-size: 0.9rem;
        }

        .view-all:hover {
          color: white;
        }

        .recent-activities,
        .top-products,
        .quick-stats {
          grid-column: span 1;
        }

        .recent-orders.full-width {
          grid-column: span 2;
        }

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-icon.new { background: rgba(59, 130, 246, 0.1); }
        .activity-icon.success { background: rgba(16, 185, 129, 0.1); }
        .activity-icon.warning { background: rgba(245, 158, 11, 0.1); }
        .activity-icon.danger { background: rgba(239, 68, 68, 0.1); }
        .activity-icon.info { background: rgba(59, 130, 246, 0.1); }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          margin: 0 0 2px 0;
          color: white;
          font-size: 0.9rem;
        }

        .activity-time {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .product-item {
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .product-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .product-name {
          color: white;
          font-weight: 500;
        }

        .product-stats {
          display: flex;
          gap: 8px;
        }

        .stock-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.8rem;
        }

        .product-metrics {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
        }

        .metric {
          flex: 1;
        }

        .metric-label {
          display: block;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.7rem;
          margin-bottom: 2px;
        }

        .metric-value {
          color: white;
          font-weight: 500;
        }

        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .orders-table-mini {
          overflow-x: auto;
        }

        .orders-table-mini table {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-table-mini th {
          text-align: left;
          padding: 12px 8px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .orders-table-mini td {
          padding: 12px 8px;
          color: white;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .stat-item {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .stat-label {
          display: block;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
          margin-bottom: 4px;
        }

        .stat-number {
          display: block;
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .stat-trend {
          font-size: 0.8rem;
        }

        .stat-trend.up {
          color: #10b981;
        }

        .stat-trend.down {
          color: #ef4444;
        }

        @media (max-width: 1200px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .recent-orders.full-width {
            grid-column: span 1;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;