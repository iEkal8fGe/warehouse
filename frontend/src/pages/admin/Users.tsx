import React, { useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';

import type { User } from '../../types';

// Моковые данные
const mockUsers: User[] = [
  { id: 1, username: 'admin', email: 'admin@example.com', is_active: true, is_superuser: true, created_at: '2026-01-15T10:00:00Z' },
  { id: 2, username: 'ivan_sklad', email: 'ivan@example.com', is_active: true, is_superuser: false, warehouse_id: 1, created_at: '2026-01-20T14:30:00Z' },
  { id: 3, username: 'petr_sklad', email: 'petr@example.com', is_active: true, is_superuser: false, warehouse_id: 2, created_at: '2026-01-25T09:15:00Z' },
  { id: 4, username: 'anna_manager', email: 'anna@example.com', is_active: false, is_superuser: false, warehouse_id: 1, created_at: '2026-02-01T11:45:00Z' },
  { id: 5, username: 'supervisor', email: 'super@example.com', is_active: true, is_superuser: true, created_at: '2026-02-05T16:20:00Z' },
  { id: 6, username: 'maria', email: 'maria@example.com', is_active: true, is_superuser: false, warehouse_id: 3, created_at: '2026-02-10T13:10:00Z' },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading] = useState(false);  // setLoading
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const columns = [
    {
      key: 'id',
      title: 'ID',
    },
    {
      key: 'username',
      title: 'Username',
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value: boolean) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
          {value ? 'Активен' : 'Неактивен'}
        </span>
      ),
    },
    {
      key: 'is_superuser',
      title: 'Role',
      render: (value: boolean) => (
        <span className={`badge ${value ? 'badge-primary' : 'badge-secondary'}`}>
          {value ? 'Admin' : 'Employee'}
        </span>
      ),
    },
    {
      key: 'warehouse_id',
      title: 'Warehouse',
      render: (value?: number) => value ? `Склад ${value}` : '—',
    },
    {
      key: 'created_at',
      title: 'Date created',
      render: (value: string) => new Date(value).toLocaleDateString('ru-RU'),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: User) => (
        <div className="actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingUser(record);
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
    <div className="users-page">
      <div className="page-header">
        <h2>Users management</h2>
        <Button
          variant="primary"
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
        >
          <span>Create User</span>
        </Button>
      </div>

      <Card className="filters-card">
        <div className="filters">
          <div className="search-wrapper">
            <Input
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <Search size={18} className="search-icon" />
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={paginatedUsers}
          loading={loading}
          pagination={{
            current: page,
            total: filteredUsers.length,
            pageSize,
            onChange: setPage,
          }}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingUser(null);
              }}
            >
              Отмена
            </Button>
            <Button variant="primary" type="submit" form="user-form">
              {editingUser ? 'Сохранить' : 'Создать'}
            </Button>
          </>
        }
      >
        {/* TODO: API Post here */}
        <form id="user-form" className="user-form">
          <div className="form-group">
            <label>Имя пользователя</label>
            <Input
              defaultValue={editingUser?.username}
              placeholder="Введите имя пользователя"
            />
          </div>
          {!editingUser && (
            <div className="form-group">
              <label>Пароль</label>
              <Input
                type="password"
                placeholder="Введите пароль"
              />
            </div>
          )}
          <div className="form-group">
            <label>Склад</label>
            <select className="select">
              <option value="">Не привязан</option>
              <option value="1">Склад 1 (Москва)</option>
              <option value="2">Склад 2 (СПб)</option>
              <option value="3">Склад 3 (Казань)</option>
            </select>
          </div>
          <div className="checkbox-group">
            <label className="checkbox">
              <input type="checkbox" defaultChecked={editingUser?.is_active} />
              <span>Активен</span>
            </label>
            <label className="checkbox">
              <input type="checkbox" defaultChecked={editingUser?.is_superuser} />
              <span>Администратор</span>
            </label>
          </div>
        </form>
      </Modal>

      <style>{`
        .users-page {
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
        
        .actions {
          display: flex;
          gap: 8px;
        }
        .user-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
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
        .checkbox-group {
          display: flex;
          gap: 24px;
        }
        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Users;