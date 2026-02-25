// import React, { useState, useEffect } from 'react';
// import { Search, Edit, Trash2 } from 'lucide-react';
// import { Button } from '../../components/ui/Button';
// import { Input } from '../../components/ui/Input';
// import { Table } from '../../components/ui/Table';
// import { Modal } from '../../components/ui/Modal';
// import { Card } from '../../components/ui/Card';
//
// import { usersAPI } from '../../lib/api/users';
// import type { User, UserCreate, UserUpdate } from '../../types/users';
//
// // Моковые данные
// // const mockUsers: User[] = [
// //   { id: 1, username: 'admin', is_active: true, is_superuser: true, created_at: '2026-01-15T10:00:00Z' },
// //   { id: 2, username: 'ivan_sklad', is_active: true, is_superuser: false, warehouse_id: 1, created_at: '2026-01-20T14:30:00Z' },
// //   { id: 3, username: 'petr_sklad', is_active: true, is_superuser: false, warehouse_id: 2, created_at: '2026-01-25T09:15:00Z' },
// //   { id: 4, username: 'swat_manager', is_active: false, is_superuser: false, warehouse_id: 1, created_at: '2026-02-01T11:45:00Z' },
// //   { id: 5, username: 'supervisor', is_active: true, is_superuser: true, created_at: '2026-02-05T16:20:00Z' },
// //   { id: 6, username: 'maria', is_active: true, is_superuser: false, warehouse_id: 3, created_at: '2026-02-10T13:10:00Z' },
// // ];
//
// const Users: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading] = useState(false);  // setLoading
//   const [searchTerm, setSearchTerm] = useState('');
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingUser, setEditingUser] = useState<User | null>(null);
//   const [page, setPage] = useState(1)
//
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//     is_active: true,
//     is_superuser: false,
//     warehouse_id: '',
//   });
//
//   const pageSize = 5;
//   useEffect(() => {
//     fetchUsers();
//   }, []);
//
//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await usersAPI.getAll();
//       setUsers(response.data);
//       setError(null);
//     } catch (err) {
//       console.error('Failed to fetch users:', err);
//       setError('Failed to load users. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const handleOpenModal = (user?: User) => {
//     if (user) {
//       setEditingUser(user);
//       setFormData({
//         username: user.username,
//         password: '',
//         is_active: user.is_active,
//         is_superuser: user.is_superuser,
//         warehouse_id: user.warehouse_id?.toString() || '',
//       });
//     } else {
//       setEditingUser(null);
//       setFormData({
//         username: '',
//         password: '',
//         is_active: true,
//         is_superuser: false,
//         warehouse_id: '',
//       });
//     }
//     setModalOpen(true);
//   };
//
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//
//     try {
//       if (editingUser) {
//         // Обновление
//         const updateData: UserUpdate = {
//           username: formData.username !== editingUser.username ? formData.username : undefined,
//           is_active: formData.is_active !== editingUser.is_active ? formData.is_active : undefined,
//           is_superuser: formData.is_superuser !== editingUser.is_superuser ? formData.is_superuser : undefined,
//           warehouse_id: formData.warehouse_id ? parseInt(formData.warehouse_id) : undefined,
//         };
//
//         // Если ввели пароль - обновляем и его
//         if (formData.password) {
//           updateData.password = formData.password;
//         }
//
//         await usersAPI.update(editingUser.id, updateData);
//       } else {
//         // Создание
//         const createData: UserCreate = {
//           username: formData.username,
//           password: formData.password,
//           is_active: formData.is_active,
//           is_superuser: formData.is_superuser,
//           warehouse_id: formData.warehouse_id ? parseInt(formData.warehouse_id) : undefined,
//         };
//         await usersAPI.create(createData);
//       }
//
//       // Перезагружаем список
//       await fetchUsers();
//       setModalOpen(false);
//     } catch (err) {
//       console.error('Failed to save user:', err);
//       alert('Failed to save user. Please check the data and try again.');
//     }
//   };
//
//   const handleDelete = async (id: number) => {
//     if (window.confirm('Are you sure you want to delete this user?')) {
//       try {
//         await usersAPI.delete(id);
//         await fetchUsers();
//       } catch (err) {
//         console.error('Failed to delete user:', err);
//         alert('Failed to delete user. Please try again.');
//       }
//     }
//   };
//
//   // only on frontend
//   const filteredUsers = users.filter(user =>
//     user.username.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//
//   const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
//
//   // const handleDelete = (id: number) => {
//   //   if (window.confirm('Are you sure want to delete this user?')) {
//   //     setUsers(users.filter(u => u.id !== id));
//   //   }
//   // };
//
//   const columns = [
//     {
//       key: 'id',
//       title: 'ID',
//     },
//     {
//       key: 'username',
//       title: 'Username',
//     },
//     {
//       key: 'is_active',
//       title: 'Status',
//       render: (value: boolean) => (
//         <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
//           {value ? 'Active' : 'Inactive'}
//         </span>
//       ),
//     },
//     {
//       key: 'is_superuser',
//       title: 'Role',
//       render: (value: boolean) => (
//         <span className={`badge ${value ? 'badge-primary' : 'badge-secondary'}`}>
//           {value ? 'Admin' : 'Employee'}
//         </span>
//       ),
//     },
//     {
//       key: 'warehouse_id',
//       title: 'Warehouse',
//       render: (value?: number) => value ? `Warehouse ${value}` : '—',
//     },
//     {
//       key: 'created_at',
//       title: 'Date created',
//       render: (value: string) => new Date(value).toLocaleDateString('en-US'),
//     },
//     {
//       key: 'actions',
//       title: 'Actions',
//       render: (_: any, record: User) => (
//         <div className="actions">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => {
//               setEditingUser(record);
//               setModalOpen(true);
//             }}
//           >
//             <Edit size={16} />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => handleDelete(record.id)}
//           >
//             <Trash2 size={16} />
//           </Button>
//         </div>
//       ),
//     },
//   ];
//
//   return (
//     <div className="users-page">
//       <div className="page-header">
//         <h2>Users management</h2>
//         <Button
//           variant="primary"
//           onClick={() => {
//             // setEditingUser(null);
//             // setModalOpen(true);
//             handleOpenModal();
//           }}
//         >
//           <span>Create User</span>
//         </Button>
//       </div>
//
//       <Card className="filters-card">
//         <div className="filters">
//           <div className="search-wrapper">
//             <Input
//               placeholder="Search by name"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="search-input"
//             />
//             <Search size={18} className="search-icon" />
//           </div>
//         </div>
//       </Card>
//
//       <Card>
//         <Table
//           columns={columns}
//           data={paginatedUsers}
//           loading={loading}
//           pagination={{
//             current: page,
//             total: filteredUsers.length,
//             pageSize,
//             onChange: setPage,
//           }}
//         />
//       </Card>
//
//       <Modal
//         isOpen={modalOpen}
//         onClose={() => {
//           setModalOpen(false);
//           setEditingUser(null);
//         }}
//         title={editingUser ? 'Edit user' : 'Create user'}
//         footer={
//           <>
//             <Button
//               variant="secondary"
//               onClick={() => {
//                 setModalOpen(false);
//                 setEditingUser(null);
//               }}
//             >
//               Cancel
//             </Button>
//             <Button variant="primary" type="submit" form="user-form">
//               {editingUser ? 'Save' : 'Submit'}
//             </Button>
//           </>
//         }
//       >
//         {/* TODO: API Post here */}
//         <form id="user-form" className="user-form">
//           <div className="form-group">
//             <label>Username</label>
//             <Input
//               defaultValue={editingUser?.username}
//               placeholder="Enter the username"
//             />
//           </div>
//           {!editingUser && (
//             <div className="form-group">
//               <label>Password</label>
//               <Input
//                 type="password"
//                 placeholder="Enter the password"
//               />
//             </div>
//           )}
//           <div className="form-group">
//             <label>Warehouse</label>
//             <select className="select">
//               <option value="">Not assigned</option>
//               <option value="1">California warehouse</option>
//               <option value="2">Illinois wh</option>
//               <option value="3">New york main</option>
//             </select>
//           </div>
//           <div className="checkbox-group">
//             <label className="checkbox">
//               <input type="checkbox" defaultChecked={editingUser?.is_active} />
//               <span>Is active</span>
//             </label>
//             <label className="checkbox">
//               <input type="checkbox" defaultChecked={editingUser?.is_superuser} />
//               <span>Is Admin</span>
//             </label>
//           </div>
//         </form>
//       </Modal>

import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';

// import { usersAPI, type User, type UserCreate, type UserUpdate } from '../../lib/api/users';
import { usersAPI } from '../../api/users';
import type { User, UserCreate, UserUpdate } from '../../types/users';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    is_active: true,
    is_superuser: false,
    warehouse_id: '',
  });

  const pageSize = 5;

  // Загрузка пользователей
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '',
        is_active: user.is_active,
        is_superuser: user.is_superuser,
        warehouse_id: user.warehouse_id?.toString() || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        is_active: true,
        is_superuser: false,
        warehouse_id: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Обновление
        const updateData: UserUpdate = {
          username: formData.username !== editingUser.username ? formData.username : undefined,
          is_active: formData.is_active !== editingUser.is_active ? formData.is_active : undefined,
          is_superuser: formData.is_superuser !== editingUser.is_superuser ? formData.is_superuser : undefined,
          warehouse_id: formData.warehouse_id ? parseInt(formData.warehouse_id) : undefined,
        };

        // Если ввели пароль - обновляем и его
        if (formData.password) {
          updateData.password = formData.password;
        }

        await usersAPI.update(editingUser.id, updateData);
      } else {
        // Создание
        const createData: UserCreate = {
          username: formData.username,
          password: formData.password,
          is_active: formData.is_active,
          is_superuser: formData.is_superuser,
          warehouse_id: formData.warehouse_id ? parseInt(formData.warehouse_id) : undefined,
        };
        await usersAPI.create(createData);
      }

      // Перезагружаем список
      await fetchUsers();
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save user:', err);
      alert('Failed to save user. Please check the data and try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.delete(id);
        await fetchUsers();
      } catch (err) {
        console.error('Failed to delete user:', err);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  // Фильтрация на фронтенде (без дополнительных запросов)
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

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
      key: 'email',
      title: 'Email',
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value: boolean) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
          {value ? 'Active' : 'Inactive'}
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
      render: (value?: number) => value ? `Warehouse ${value}` : '—',
    },
    {
      key: 'created_at',
      title: 'Date created',
      render: (value: string) => new Date(value).toLocaleDateString('en-US'),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: User) => (
        <div className="actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(record)}
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

  if (error) {
    return (
      <div className="users-page">
        <div className="error-message">{error}</div>
        <Button variant="primary" onClick={fetchUsers}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h2>Users Management</h2>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} />
          <span>Create User</span>
        </Button>
      </div>

      <Card className="filters-card">
        <div className="filters">
          <div className="search-wrapper">
            <Input
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
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
        title={editingUser ? 'Edit User' : 'Create User'}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="user-form">
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </>
        }
      >
        <form id="user-form" className="user-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter username"
              required
            />
          </div>

          {!editingUser && (
            <div className="form-group">
              <label>Password *</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                required={!editingUser}
              />
            </div>
          )}

          {editingUser && (
            <div className="form-group">
              <label>New Password (leave empty to keep current)</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
          )}

          <div className="form-group">
            <label>Warehouse</label>
            <select
              className="select"
              value={formData.warehouse_id}
              onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
            >
              <option value="">Not assigned</option>
              <option value="1">California Warehouse</option>
              <option value="2">Illinois Warehouse</option>
              <option value="3">New York Main</option>
            </select>
          </div>

          <div className="checkbox-group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>Is Active</span>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.is_superuser}
                onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
              />
              <span>Is Admin</span>
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