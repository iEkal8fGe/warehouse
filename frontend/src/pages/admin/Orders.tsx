import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Package, MapPin, Truck, Hash } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import type { Order, OrderItem } from '../../types';

// Mock data based on your SQLAlchemy models
const mockOrderStatuses = [
  { id: 1, name: 'New' },
  { id: 2, name: 'Shipping' },
  { id: 3, name: 'Delivered' }
];

const mockWarehouses = [
  { id: 1, name: 'Main Warehouse' },
  { id: 2, name: 'North Warehouse' },
  { id: 3, name: 'South Warehouse' },
];

const mockProducts = [
  { id: 1, name: 'Trenbolone 100mg', sku: 'TRE-100' },
  { id: 2, name: 'Retatrutide 50mg', sku: 'RET-050' },
  { id: 3, name: 'Retatrutide 25mg', sku: 'RET-025' },
  { id: 4, name: 'Logitech MX Master 3', sku: 'MOUSE-LOGI-MX' },
  { id: 5, name: 'Samsung 1TB SSD', sku: 'SSD-SAMS-1TB' },
];

const mockOrders: Order[] = [
  {
    id: 1,
    order_number: 'ORD-2026-00001',
    external_order_id: 'EXT-ABC-12345',
    warehouse_id: 1,
    status_id: 1,
    postal_code: '240105',
    country: 'United States',
    city: 'New York',
    address: 'Paper St. 12, Apt 45',
    notes: 'Faster please',
    created_at: '2026-02-15T10:30:00Z',
    updated_at: '2026-02-15T10:30:00Z',
    shipped_at: null,
    items: [
      { id: 1, order_id: 1, product_id: 1, quantity: 2 },
      { id: 2, order_id: 1, product_id: 3, quantity: 1 },
    ]
  },
  {
    id: 2,
    order_number: 'ORD-2026-00002',
    external_order_id: 'EXT-XYZ-78901',
    warehouse_id: 2,
    status_id: 5,
    postal_code: '190000',
    country: 'Russia',
    city: 'Saint Petersburg',
    address: 'Nevsky Prospect 45, Apt 12',
    notes: '',
    created_at: '2026-02-14T15:45:00Z',
    updated_at: '2026-02-16T09:20:00Z',
    shipped_at: '2026-02-16T09:20:00Z',
    items: [
      { id: 3, order_id: 2, product_id: 2, quantity: 1 },
      { id: 4, order_id: 2, product_id: 4, quantity: 1 },
      { id: 5, order_id: 2, product_id: 5, quantity: 3 },
    ]
  },
  {
    id: 3,
    order_number: 'ORD-2026-00003',
    external_order_id: 'EXT-123-45678',
    warehouse_id: 1,
    status_id: 3,
    postal_code: '420000',
    country: 'Russia',
    city: 'Kazan',
    address: 'Baumana St. 8',
    notes: 'Office delivery, working hours 9-18',
    created_at: '2026-02-13T08:15:00Z',
    updated_at: '2026-02-14T11:30:00Z',
    shipped_at: null,
    items: [
      { id: 6, order_id: 3, product_id: 1, quantity: 1 },
    ]
  },
  {
    id: 4,
    order_number: 'ORD-2026-00004',
    external_order_id: 'EXT-456-78901',
    warehouse_id: 3,
    status_id: 2,
    postal_code: '630000',
    country: 'Russia',
    city: 'Novosibirsk',
    address: 'Lenina St. 20',
    notes: '',
    created_at: '2026-02-12T12:00:00Z',
    updated_at: '2026-02-12T14:20:00Z',
    shipped_at: null,
    items: [
      { id: 7, order_id: 4, product_id: 2, quantity: 2 },
      { id: 8, order_id: 4, product_id: 5, quantity: 2 },
    ]
  },
  {
    id: 5,
    order_number: 'ORD-2026-00005',
    external_order_id: 'EXT-789-12345',
    warehouse_id: 2,
    status_id: 7,
    postal_code: '344000',
    country: 'Russia',
    city: 'Rostov-on-Don',
    address: 'Pushkinskaya St. 32',
    notes: 'Customer requested cancellation',
    created_at: '2026-02-10T09:30:00Z',
    updated_at: '2026-02-11T16:45:00Z',
    shipped_at: null,
    items: [
      { id: 9, order_id: 5, product_id: 3, quantity: 2 },
      { id: 10, order_id: 5, product_id: 4, quantity: 1 },
    ]
  },
  {
    id: 6,
    order_number: 'ORD-2026-00006',
    external_order_id: 'EXT-321-65498',
    warehouse_id: 1,
    status_id: 4,
    postal_code: '603000',
    country: 'Russia',
    city: 'Nizhny Novgorod',
    address: 'Bolshaya Pokrovskaya St. 15',
    notes: '',
    created_at: '2026-02-09T14:20:00Z',
    updated_at: '2026-02-10T10:15:00Z',
    shipped_at: null,
    items: [
      { id: 11, order_id: 6, product_id: 1, quantity: 1 },
      { id: 12, order_id: 6, product_id: 2, quantity: 1 },
      { id: 13, order_id: 6, product_id: 5, quantity: 2 },
    ]
  },
];

const Orders: React.FC = () => {
  const [orders] = useState<Order[]>(mockOrders);   // setOrders
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.external_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const toggleRow = (orderId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (statusId: number) => {
    const status = mockOrderStatuses.find(s => s.id === statusId);
    if (!status) return null;

    const statusStyles = {
      'New': 'badge-danger',
      'Shipping': 'badge-warning',
      'Delivered': 'badge-success'
    };

    const style = statusStyles[status.name as keyof typeof statusStyles] || 'badge-secondary';

    return (
      <span className={`badge ${style}`}>
        {status.name}
      </span>
    );
  };

  const getWarehouseName = (warehouseId: number) => {
    return mockWarehouses.find(w => w.id === warehouseId)?.name || `Warehouse ${warehouseId}`;
  };

  const getProductName = (productId: number) => {
    return mockProducts.find(p => p.id === productId)?.name || `Product ${productId}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>Order Management</h2>
      </div>

      <Card className="filters-card">
        <div className="filters">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <Input
              placeholder="Search by order #, external ID, city or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="orders-table">
          <div className="orders-header">
            <div className="header-cell" style={{ width: '80px' }}>ID</div>
            <div className="header-cell" style={{ width: '150px' }}>Order Number</div>
            <div className="header-cell" style={{ width: '150px' }}>External ID</div>
            <div className="header-cell" style={{ width: '150px' }}>Warehouse</div>
            <div className="header-cell" style={{ width: '100px' }}>Status</div>
            <div className="header-cell" style={{ width: '180px' }}>Created At</div>
            <div className="header-cell" style={{ width: '180px' }}>Updated At</div>
            <div className="header-cell" style={{ width: '40px' }}></div>
          </div>

          {paginatedOrders.map((order) => (
            <React.Fragment key={order.id}>
              <div
                className={`order-row ${expandedRows.has(order.id) ? 'expanded' : ''}`}
                onClick={() => toggleRow(order.id)}
              >
                <div className="row-cell" style={{ width: '80px' }}>#{order.id}</div>
                <div className="row-cell" style={{ width: '150px' }}>
                  <div className="order-number">
                    <Hash size={14} />
                    {order.order_number}
                  </div>
                </div>
                <div className="row-cell" style={{ width: '150px' }}>
                  {order.external_order_id ? (
                    <div className="external-id">
                      {order.external_order_id}
                    </div>
                  ) : '—'}
                </div>
                <div className="row-cell" style={{ width: '150px' }}>
                  {getWarehouseName(order.warehouse_id)}
                </div>
                <div className="row-cell" style={{ width: '100px' }}>
                  {getStatusBadge(order.status_id)}
                </div>
                <div className="row-cell" style={{ width: '180px' }}>
                  <div className="date-cell">
                    {formatDate(order.created_at)}
                  </div>
                </div>
                <div className="row-cell" style={{ width: '180px' }}>
                  <div className="date-cell">
                    {formatDate(order.updated_at)}
                  </div>
                </div>
                <div className="row-cell expand-icon" style={{ width: '40px' }}>
                  {expandedRows.has(order.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {expandedRows.has(order.id) && (
                <div className="order-details">
                  <div className="details-grid">
                    <div className="details-section">
                      <h4>
                        <MapPin size={16} />
                        Delivery Address
                      </h4>
                      <div className="address-details">
                        <p><strong>Postal Code:</strong> {order.postal_code}</p>
                        <p><strong>Country:</strong> {order.country}</p>
                        <p><strong>City:</strong> {order.city}</p>
                        <p><strong>Address:</strong> {order.address}</p>
                        {order.notes && (
                          <p className="notes">
                            <strong>Notes:</strong> {order.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>
                        <Package size={16} />
                        Order Items
                      </h4>
                      <div className="items-list">
                        {order.items?.map((item: OrderItem) => (
                          <div key={item.id} className="item-row">
                            <span className="item-name">{getProductName(item.product_id)}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.shipped_at && (
                      <div className="details-section full-width">
                        <h4>
                          <Truck size={16} />
                          Shipping Information
                        </h4>
                        <p><strong>Shipped at:</strong> {formatDate(order.shipped_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {paginatedOrders.length === 0 && (
            <div className="no-results">
              No orders found
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </Card>

      <style>{`
        .orders-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .orders-table {
          width: 100%;
          overflow-x: auto;
        }

        .orders-header {
          display: flex;
          padding: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          min-width: 1000px;
        }

        .header-cell {
          padding: 0 8px;
        }

        .order-row {
          display: flex;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: background 0.2s;
          min-width: 1000px;
        }

        .order-row:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .order-row.expanded {
          background: rgba(255, 255, 255, 0.1);
          border-bottom: none;
        }

        .row-cell {
          padding: 0 8px;
          display: flex;
          align-items: center;
        }

        .order-number, .external-id, .date-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .external-id {
          color: rgba(255, 255, 255, 0.7);
          font-family: monospace;
        }

        .expand-icon {
          justify-content: center;
          color: rgba(255, 255, 255, 0.5);
        }

        .order-details {
          background: rgba(0, 0, 0, 0.2);
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .details-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
          padding: 16px;
        }

        .details-section.full-width {
          grid-column: 1 / -1;
        }

        .details-section h4 {
          margin: 0 0 12px 0;
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .address-details p {
          margin: 8px 0;
          color: rgba(255, 255, 255, 0.9);
        }

        .address-details strong {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
          min-width: 100px;
          display: inline-block;
        }

        .notes {
          margin-top: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          font-style: italic;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .item-name {
          color: white;
        }

        .item-quantity {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .no-results {
          text-align: center;
          padding: 48px;
          color: rgba(255, 255, 255, 0.5);
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

        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Orders;