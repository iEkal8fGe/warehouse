import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Package,
  Plus,
  Minus,
  Trash2,
  Truck,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

import type { Product, CartItem, Supply } from '../../types';


// Mock data
const availableProducts: Product[] = [
  { id: 1, name: 'Trenbolone 25', sku: 'TIR-25', cost_price: 50.0, is_active: true },
  { id: 2, name: 'Trenbolone 50', sku: 'TIR-50', cost_price: 50.0, is_active: true },
  { id: 3, name: 'Retatrutide 25', sku: 'RET-25', cost_price: 50.0, is_active: true },
  { id: 4, name: 'Retatrutide 30', sku: 'RET-30', cost_price: 50.0, is_active: true },
  { id: 5, name: 'Retatrutide 50', sku: 'RET-50', cost_price: 50.0, is_active: true },
  { id: 6, name: 'Retatrutide 75', sku: 'RET-75', cost_price: 50.0, is_active: true },
  { id: 7, name: 'Tirzepatide 25', sku: 'TIR-25', cost_price: 50.0, is_active: true },
  { id: 8, name: 'Tirzepatide 50', sku: 'TIR-50', cost_price: 50.0, is_active: true },
  { id: 9, name: 'Tirzepatide 75', sku: 'TIR-75', cost_price: 50.0, is_active: true },
  { id: 10, name: 'Anastrazole 10', sku: 'ANA-10', cost_price: 50.0, is_active: true }
];

const mockSupplies: Supply[] = [
  {
    id: 1,
    supply_number: 'SUP-2026-0042',
    created_at: '2026-02-20T10:30:00Z',
    items: [
      { product_id: 1, product_name: 'Dell XPS 13 Laptop', sku: 'LAP-DELL-XPS-001', quantity: 5 },
      { product_id: 3, product_name: 'Logitech MX Keys', sku: 'KEY-LOGI-MX-003', quantity: 10 },
      { product_id: 5, product_name: 'Samsung 1TB SSD', sku: 'SSD-SAMS-1TB-005', quantity: 8 },
    ]
  },
  {
    id: 2,
    supply_number: 'SUP-2026-0041',
    created_at: '2026-02-19T14:15:00Z',
    items: [
      { product_id: 2, product_name: 'Samsung 27" Monitor', sku: 'MON-SAMS-27-002', quantity: 3 },
      { product_id: 4, product_name: 'Logitech MX Master 3', sku: 'MOUSE-LOGI-MX-004', quantity: 9 },
    ]
  },
  {
    id: 3,
    supply_number: 'SUP-2026-0040',
    created_at: '2026-02-18T09:45:00Z',
    items: [
      { product_id: 6, product_name: 'Kingston 16GB RAM', sku: 'RAM-KING-16-006', quantity: 12 },
      { product_id: 8, product_name: 'Corsair 750W PSU', sku: 'PSU-CORS-750-008', quantity: 6 },
    ]
  },
  {
    id: 4,
    supply_number: 'SUP-2026-0039',
    created_at: '2026-02-17T16:20:00Z',
    items: [
      { product_id: 7, product_name: 'RTX 3060 Graphics Card', sku: 'GPU-RTX-3060-007', quantity: 4 },
      { product_id: 9, product_name: 'NZXT H510 Case', sku: 'CASE-NZXT-510-009', quantity: 7 },
      { product_id: 10, product_name: 'WD 2TB External HDD', sku: 'HDD-WD-2TB-010', quantity: 20 },
    ]
  },
  {
    id: 5,
    supply_number: 'SUP-2026-0038',
    created_at: '2026-02-16T11:10:00Z',
    items: [
      { product_id: 1, product_name: 'Dell XPS 13 Laptop', sku: 'LAP-DELL-XPS-001', quantity: 2 },
      { product_id: 2, product_name: 'Samsung 27" Monitor', sku: 'MON-SAMS-27-002', quantity: 6 },
    ]
  },
];

const Supplies: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [supplies] = useState(mockSupplies);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProductDropdown(false);
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const pageSize = 10;

  // Filter products based on search
  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filter supplies based on search
  const filteredSupplies = supplies.filter(supply =>
    supply.supply_number.toLowerCase().includes(historySearch.toLowerCase())
  );

  const paginatedSupplies = filteredSupplies.slice((historyPage - 1) * pageSize, historyPage * pageSize);
  const totalPages = Math.ceil(filteredSupplies.length / pageSize);

  const toggleRow = (supplyId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(supplyId)) {
      newExpanded.delete(supplyId);
    } else {
      newExpanded.add(supplyId);
    }
    setExpandedRows(newExpanded);
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        quantity: 1,
      }]);
    }

    setProductSearch('');
    setShowProductDropdown(false);

    // Добавляем задержку перед снятием фокуса, чтобы не конфликтовать с handleClickOutside
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }, 10);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const handleSubmitSupply = () => {
    setShowConfirmDialog(true);
  };

  const confirmSupply = () => {
    console.log('Submitting supply:', cart);
    setCart([]);
    setShowConfirmDialog(false);
    setActiveTab('history');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Custom table component with expandable rows
  const renderSupplyTable = () => (
    <div className="custom-table">
      <div className="custom-table-header">
        <div className="header-cell" style={{ width: '50%' }}>Supply Number</div>
        <div className="header-cell" style={{ width: '45%' }}>Date</div>
        <div className="header-cell" style={{ width: '5%' }}></div>
      </div>

      {paginatedSupplies.map((supply) => (
        <React.Fragment key={supply.id}>
          <div
            className={`custom-table-row ${expandedRows.has(supply.id) ? 'expanded' : ''}`}
            onClick={() => toggleRow(supply.id)}
          >
            <div className="row-cell" style={{ width: '50%' }}>
              <div className="supply-number">
                <Truck size={16} style={{ color: 'rgba(255,255,255,0.7)', marginRight: '8px' }} />
                <span>{supply.supply_number}</span>
              </div>
            </div>
            <div className="row-cell" style={{ width: '45%' }}>
              <div className="date-cell">
                <Calendar size={14} style={{ color: 'rgba(255,255,255,0.7)', marginRight: '8px' }} />
                <span>{formatDate(supply.created_at)}</span>
              </div>
            </div>
            <div className="row-cell expand-icon" style={{ width: '5%' }}>
              {expandedRows.has(supply.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {expandedRows.has(supply.id) && (
            <div className="supply-details">
              <div className="details-header">
                <span>Product</span>
                <span>Quantity</span>
              </div>
              {supply.items.map((item, idx) => (
                <div key={idx} className="detail-row">
                  <span className="product-name">
                    <Package size={14} style={{ marginRight: '8px', opacity: 0.7 }} />
                    {item.product_name}
                  </span>
                  <span className="product-quantity">x{item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </React.Fragment>
      ))}

      {paginatedSupplies.length === 0 && (
        <div className="no-results">No supplies found</div>
      )}
    </div>
  );

  return (
    <div className="supplies-page">
      <div className="page-header">
        <h2>Supply Management</h2>
        <div className="total-supplies">
          <span className="total-label">Total Supplies:</span>
          <span className="total-value">{supplies.length}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          <Package size={18} />
          <span>New Supply</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Truck size={18} />
          <span>Supply History</span>
        </button>
      </div>

      {activeTab === 'new' ? (
        <div className="new-supply">
          {/* Product Selection */}
            <Card className="product-selection-card" style={{ position: 'relative', zIndex: 1000 }}>
              <h3>Add Products</h3>
              <div className="product-search-container" ref={searchRef}>
                <div className="search-wrapper">
                  <Search size={18} className="search-icon" />
                  <Input
                    ref={inputRef}
                    placeholder="Search products by name or SKU"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="search-input"
                  />
                </div>

                {showProductDropdown && (
                  <div className="product-dropdown">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <div
                          key={product.id}
                          className="product-option"
                          onClick={() => {
                            addToCart(product);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <div className="product-info">
                            <span className="product-name">{product.name}</span>
                            <span className="product-sku">{product.sku}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results-dropdown">No products found</div>
                    )}
                  </div>
                )}
              </div>
            </Card>

          {/* Cart */}
          {cart.length > 0 && (
            <Card className="cart-card">
              <div className="cart-header">
                <h3>Supply Cart</h3>
                <span className="cart-badge">{totalItems} items total</span>
              </div>

              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.product_id} className="cart-item">
                    <div className="item-info">
                      <span className="item-name">{item.product_name}</span>
                      <span className="item-sku">{item.sku}</span>
                    </div>

                    <div className="item-actions">
                      <div className="quantity-control">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.product_id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.product_id, 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <Button
                  variant="secondary"
                  onClick={() => setCart([])}
                >
                  Clear Cart
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitSupply}
                >
                  Submit Supply
                </Button>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="supply-history">
          <Card>
            <div className="table-header">
              <h3>Supply History</h3>
              <div className="search-wrapper small">
                <Search size={16} className="search-icon" />
                <Input
                  placeholder="Search by supply number..."
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="search-input small"
                />
              </div>
            </div>

            {renderSupplyTable()}

            {/* Pagination */}
            {filteredSupplies.length > 0 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {historyPage} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                  disabled={historyPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmSupply}
        title="Confirm Supply"
        message={`Are you sure you want to create this supply with ${cart.length} different products and ${totalItems} total items?`}
        confirmText="Yes, Create Supply"
        cancelText="Cancel"
        type="warning"
      />

      <style>{`
        .supplies-page {
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

        .total-supplies {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .total-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .total-value {
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .tab-navigation {
          display: flex;
          gap: 12px;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px;
          border-radius: 40px;
          width: fit-content;
          backdrop-filter: blur(10px);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          border-radius: 32px;
          transition: all 0.3s;
        }

        .tab-btn.active {
          background: white;
          color: #667eea;
        }

        .product-selection-card {
          position: relative;
          z-index: 1000;
        }
        
        .product-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: rgba(30, 30, 40, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          z-index: 1001 !important; /* Форсированно выше */
          max-height: 300px;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .cart-card {
          position: relative;
          z-index: 1;
        }

        .product-selection-card,
        .cart-card {
          margin-top: 20px;
        }

        .product-selection-card h3,
        .cart-card h3,
        .table-header h3 {
          margin: 0 0 16px 0;
          color: white;
        }

        .product-search-container {
          position: relative;
          z-index: 100;
        }
        .product-option {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-option:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .product-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .product-name {
          color: white;
          font-weight: 500;
        }

        .product-sku {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          font-family: monospace;
        }

        .product-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .cart-badge {
          padding: 4px 12px;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid #10b981;
          border-radius: 20px;
          color: #10b981;
          font-weight: 500;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 20px;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-name {
          color: white;
          font-weight: 500;
        }

        .item-sku {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          font-family: monospace;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 4px;
        }

        .qty-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          border-radius: 50%;
        }

        .qty-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .quantity {
          color: white;
          font-weight: 600;
          min-width: 20px;
          text-align: center;
        }

        .remove-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          border-radius: 50%;
        }

        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .cart-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 0 16px;
        }

        .table-header h3 {
          margin: 0;
        }

        .search-wrapper.small {
          width: 250px;
        }

        .search-input.small input {
          padding: 8px 8px 8px 36px;
          font-size: 0.9rem;
        }

        /* Custom Table Styles */
        .custom-table {
          width: 100%;
        }

        .custom-table-header {
          display: flex;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }

        .custom-table-row {
          display: flex;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          transition: background 0.2s;
          cursor: pointer;
        }

        .custom-table-row:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .custom-table-row.expanded {
          background: rgba(255, 255, 255, 0.1);
          border-bottom: none;
        }

        .header-cell,
        .row-cell {
          padding: 0 8px;
          display: flex;
          align-items: center;
        }

        .supply-number,
        .date-cell {
          display: flex;
          align-items: center;
          width: 100%;
        }

        .expand-icon {
          justify-content: center;
          color: rgba(255, 255, 255, 0.5);
          pointer-events: none; /* Make icon non-interactive */
        }

        .supply-details {
          background: rgba(0, 0, 0, 0.2);
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          color: white;
        }

        .product-name {
          display: flex;
          align-items: center;
        }

        .product-quantity {
          color: #10b981;
          font-weight: 600;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .badge-info {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: 1px solid #3b82f6;
        }

        .pagination {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pagination-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pagination-info {
          color: white;
        }

        .no-results {
          padding: 48px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
        }

        .no-results-dropdown {
          padding: 20px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .cart-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .item-actions {
            width: 100%;
            justify-content: space-between;
          }

          .cart-footer {
            flex-direction: column;
          }

          .cart-footer button {
            width: 100%;
          }

          .table-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .search-wrapper.small {
            width: 100%;
          }

          .custom-table-header,
          .custom-table-row {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Supplies;