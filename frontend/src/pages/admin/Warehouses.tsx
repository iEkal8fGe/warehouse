import React, { useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import type { Warehouse } from '../../types';

// Моковые данные для складов
const mockWarehouses: Warehouse[] = [
  {
    id: 1,
    name: 'Main California',
    state: 'California',
    city: 'Denver',
    is_active: true,
    description: '',
    users: [1, 2]
  },
  {
    id: 2,
    name: 'North Carolina',
    state: 'North Carolina',
    city: 'VANKouver',
    is_active: true,
    description: '',
    users: [3]
  },
  {
    id: 3,
    name: 'Florida WH',
    state: 'Philadelphia',
    city: 'Florida',
    is_active: true,
    description: '',
    users: []
  },
  {
    id: 4,
    name: 'New Yourk wh',
    state: 'New York',
    city: 'New York',
    is_active: false,
    description: 'Temporarily disabled',
    users: []
  },
];

const Warehouses: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [loading] = useState(false);    // setLoading
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedWarehouses = filteredWarehouses.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure want to delete this warehouse?')) {
      setWarehouses(warehouses.filter(w => w.id !== id));
    }
  };

  const getEmployeeCount = (warehouse: Warehouse) => {
    return warehouse.users?.length || 0;
  };

  const columns = [
    {
      key: 'id',
      title: 'ID',
      width: '60px',
    },
    {
      key: 'name',
      title: 'Title',
      width: '180px',
      render: (value: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'location',
      title: 'Location',
      width: '200px',
      render: (_: any, record: Warehouse) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{record.city}, {record.state}</span>
        </div>
      ),
    },
    {
      key: 'is_active',
      title: 'Status',
      width: '100px',
      render: (value: boolean) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
          {value ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'Employee',
      title: 'Employees',
      width: '100px',
      render: (_: any, record: Warehouse) => (
        <span className="badge badge-warning">
          {getEmployeeCount(record)} emp.
        </span>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      width: '200px',
      render: (value: string) => value || '—',
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '100px',
      render: (_: any, record: Warehouse) => (
        <div className="actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingWarehouse(record);
              setModalOpen(true);
            }}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(record.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="warehouses-page">
      <div className="page-header">
        <h2>Manage warehouses</h2>
        <Button
          variant="primary"
          onClick={() => {
            setEditingWarehouse(null);
            setModalOpen(true);
          }}
        >
          <span>Create warehouse</span>
        </Button>
      </div>

      <Card className="filters-card">
        <div className="filters">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <Input
              placeholder="Search by name or city"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={paginatedWarehouses}
          loading={loading}
          pagination={{
            current: page,
            total: filteredWarehouses.length,
            pageSize,
            onChange: setPage,
          }}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingWarehouse(null);
        }}
        title={editingWarehouse ? 'Edit warehouse' : 'Create warehouse'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingWarehouse(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="warehouse-form">
              {editingWarehouse ? 'Save' : 'Submit'}
            </Button>
          </>
        }
      >
        <form id="warehouse-form" className="warehouse-form">
          <div className="form-group">
            <label>Warehouse title</label>
            <Input
              defaultValue={editingWarehouse?.name}
              placeholder="Enter warehouse title"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>State</label>
              <Input
                defaultValue={editingWarehouse?.state}
                placeholder="Enter the state/region"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <Input
                defaultValue={editingWarehouse?.city}
                placeholder="Enter the city"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="textarea"
              defaultValue={editingWarehouse?.description}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="checkbox-group">
            <label className="checkbox">
              <input type="checkbox" defaultChecked={editingWarehouse?.is_active ?? true} />
              <span>Active</span>
            </label>
          </div>
        </form>
      </Modal>

      <style>{`
        .warehouses-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .warehouse-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 60vh; /* Ограничиваем высоту */
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: white;
          font-weight: 500;
        }

        .form-group small {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
        }

        .textarea {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-sm);
          color: white;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
        }

        .textarea:focus {
          outline: none;
          border-color: var(--primary);
        }

        .checkbox-group {
          margin-top: 8px;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
        }

        .hint {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Warehouses;