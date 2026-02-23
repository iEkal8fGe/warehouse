import React, { useState } from 'react';
import { Search, Package, AlertTriangle, Filter, ChevronDown } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';

// Mock data for inventory
const mockInventory = [
  { id: 1, product_name: 'Trenbolone 100', sku: 'TRE-100', quantity: 15, low_stock_threshold: 5 },
  { id: 2, product_name: 'Tirzepatide 50', sku: 'TIR-50', quantity: 0, low_stock_threshold: 3 },
  { id: 3, product_name: 'Tirzepatide 25', sku: 'TIR-25', quantity: 23, low_stock_threshold: 5 },
  { id: 4, product_name: 'Tirzepatide 75', sku: 'TIR-75', quantity: 17, low_stock_threshold: 5 },
  { id: 5, product_name: 'Retatrutide 25', sku: 'RET-25', quantity: 42, low_stock_threshold: 10 },
  { id: 6, product_name: 'Retatrutide 50', sku: 'RET-50', quantity: 31, low_stock_threshold: 10 },
  { id: 7, product_name: 'Retatrutide 30', sku: 'RET-30', quantity: 3, low_stock_threshold: 5 },
  { id: 8, product_name: 'Anastrazole 10', sku: 'ANA-10', quantity: 12, low_stock_threshold: 4 },
  { id: 9, product_name: 'Testosterone Propionate 250', sku: 'TES-PRO-250', quantity: 7, low_stock_threshold: 3 },
  { id: 10, product_name: 'Testosterone MIX 250', sku: 'TES-MIX-250', quantity: 19, low_stock_threshold: 5 },
  { id: 11, product_name: 'Testosterone Undecylnate 250', sku: 'TES-UND-250', quantity: 4, low_stock_threshold: 5 }
];

const Inventory: React.FC = () => {
  const [inventory] = useState(mockInventory);
  const [searchTerm, setSearchTerm] = useState('');
  // const [categoryFilter] = useState('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filter and search
  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      // item.category.toLowerCase().includes(searchTerm.toLowerCase());

    // const matchesCategory = categoryFilter === 'All';
    const matchesLowStock = showLowStockOnly ? item.quantity <= item.low_stock_threshold : true;

    return matchesSearch && matchesLowStock;
  });

  const paginatedInventory = filteredInventory.slice((page - 1) * pageSize, page * pageSize);
  // const totalPages = Math.ceil(filteredInventory.length / pageSize);

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= threshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockLabel = (quantity: number, threshold: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= threshold) return `Low Stock (${quantity} left)`;
    return 'In Stock';
  };

  const columns = [
    {
      key: 'product_name',
      title: 'Product Name',
      render: (value: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'sku',
      title: 'SKU',
      render: (value: string) => (
        <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>{value}</span>
      ),
    },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (value: number, record: any) => {
        const status = getStockStatus(value, record.low_stock_threshold);
        return (
          <span className={`quantity ${status}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, record: any) => {
        const status = getStockStatus(record.quantity, record.low_stock_threshold);
        return (
          <div className={`stock-status status-${status}`}>
            {status === 'low-stock' && <AlertTriangle size={14} />}
            <span>{getStockLabel(record.quantity, record.low_stock_threshold)}</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h2>Inventory Management</h2>
        <div className="stock-summary">
          <div className="summary-item">
            <span className="summary-label">Total Items:</span>
            <span className="summary-value">{inventory.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Low Stock:</span>
            <span className="summary-value warning">
              {inventory.filter(i => i.quantity <= i.low_stock_threshold).length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Out of Stock:</span>
            <span className="summary-value danger">
              {inventory.filter(i => i.quantity === 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <div className="filters-header">
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>Filters & Search</span>
            <ChevronDown size={16} className={`arrow ${showFilters ? 'open' : ''}`} />
          </button>
        </div>

        <div className={`filters-content ${showFilters ? 'show' : ''}`}>
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <Input
              placeholder="Search by product name, SKU"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
              />
              <span>Show low stock only</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <Table
          columns={columns}
          data={paginatedInventory}
          pagination={{
            current: page,
            total: filteredInventory.length,
            pageSize,
            onChange: setPage,
          }}
        />
      </Card>

      <style>{`
        .inventory-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-header h2 {
          color: white;
          margin: 0;
          font-size: 1.8rem;
        }

        .stock-summary {
          display: flex;
          gap: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 12px 24px;
          border-radius: 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
        }

        .summary-label {
          opacity: 0.7;
          font-size: 0.9rem;
        }

        .summary-value {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .summary-value.warning {
          color: #f59e0b;
        }

        .summary-value.danger {
          color: #ef4444;
        }

        .filters-card {
          padding: 0;
          overflow: hidden;
        }

        .filters-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-weight: 500;
        }

        .filter-toggle .arrow {
          transition: transform 0.3s;
          margin-left: auto;
        }

        .filter-toggle .arrow.open {
          transform: rotate(180deg);
        }

        .filters-content {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.3s ease;
          padding: 0 20px;
        }

        .filters-content.show {
          max-height: 300px;
          opacity: 1;
          padding: 20px;
        }

        .filter-controls {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-group label {
          color: white;
          font-weight: 500;
        }

        .filter-select {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          cursor: pointer;
        }

        .filter-select option {
          background: #333;
          color: white;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          cursor: pointer;
        }

        .quantity {
          font-weight: 600;
        }

        .quantity.low-stock {
          color: #f59e0b;
        }

        .quantity.out-of-stock {
          color: #ef4444;
        }

        .stock-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .stock-status.status-in-stock {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid #10b981;
        }

        .stock-status.status-low-stock {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid #f59e0b;
        }

        .stock-status.status-out-of-stock {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid #ef4444;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .stock-summary {
            width: 100%;
            justify-content: space-around;
          }

          .filter-controls {
            flex-direction: column;
            align-items: flex-start;
          }

          .filter-group {
            width: 100%;
          }

          .filter-select {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Inventory;