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
    name: 'Главный склад',
    state: 'Москва',
    city: 'Москва',
    is_active: true,
    description: 'Основной склад в Москве',
    users: [1, 2]
  },
  {
    id: 2,
    name: 'Северный склад',
    state: 'Ленинградская область',
    city: 'Санкт-Петербург',
    is_active: true,
    description: 'Филиал в Санкт-Петербурге',
    users: [3]
  },
  {
    id: 3,
    name: 'Южный склад',
    state: 'Краснодарский край',
    city: 'Краснодар',
    is_active: true,
    description: 'Южный филиал',
    users: []
  },
  {
    id: 4,
    name: 'Западный склад',
    state: 'Калининградская область',
    city: 'Калининград',
    is_active: false,
    description: 'Временно закрыт',
    users: []
  },
  {
    id: 5,
    name: 'Восточный склад',
    state: 'Новосибирская область',
    city: 'Новосибирск',
    is_active: true,
    description: 'Склад в Новосибирске',
    users: [4, 5]
  },
  {
    id: 6,
    name: 'Татарстан склад',
    state: 'Республика Татарстан',
    city: 'Казань',
    is_active: true,
    description: 'Склад в Казани',
    users: [6]
  },
  {
    id: 7,
    name: 'Уральский склад',
    state: 'Свердловская область',
    city: 'Екатеринбург',
    is_active: true,
    description: 'Склад в Екатеринбурге',
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
    if (window.confirm('Вы уверены, что хотите удалить этот склад?')) {
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
          {value ? 'Активен' : 'Неактивен'}
        </span>
      ),
    },
    {
      key: 'Employee',
      title: 'Сотрудники',
      width: '100px',
      render: (_: any, record: Warehouse) => (
        <span className="badge badge-info">
          {getEmployeeCount(record)} чел.
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
        <h2>Управление складами</h2>
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
              placeholder="Поиск по названию или городу..."
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
        title={editingWarehouse ? 'Редактировать склад' : 'Создать склад'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingWarehouse(null);
              }}
            >
              Отмена
            </Button>
            <Button variant="primary" type="submit" form="warehouse-form">
              {editingWarehouse ? 'Сохранить' : 'Создать'}
            </Button>
          </>
        }
      >
        <form id="warehouse-form" className="warehouse-form">
          <div className="form-group">
            <label>Название склада</label>
            <Input
              defaultValue={editingWarehouse?.name}
              placeholder="Введите название склада"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Город</label>
              <Input
                defaultValue={editingWarehouse?.city}
                placeholder="Введите город"
              />
            </div>
            <div className="form-group">
              <label>Область/Регион</label>
              <Input
                defaultValue={editingWarehouse?.state}
                placeholder="Введите регион"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              className="textarea"
              defaultValue={editingWarehouse?.description}
              placeholder="Введите описание склада"
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

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-header h2 {
          color: white;
          margin: 0;
        }

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

        .select {
          padding: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-sm);
          color: white;
          font-size: 1rem;
          min-height: 120px;
        }

        .select option {
          padding: 8px;
          background: #1f2937;
        }

        .select option:checked {
          background: var(--primary);
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