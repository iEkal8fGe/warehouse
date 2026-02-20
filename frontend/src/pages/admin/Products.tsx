import React, { useState } from 'react';
import { Search, Edit, Trash2, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import type { Product } from '../../types';

// Моковые данные для товаров
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Ноутбук Dell XPS 13',
    sku: 'LAP-DELL-XPS-001',
    description: 'Ноутбук Dell XPS 13, Intel Core i7, 16GB RAM, 512GB SSD',
    cost_price: 85000,
    is_active: true
  },
  {
    id: 2,
    name: 'Монитор Samsung 27"',
    sku: 'MON-SAMS-27-002',
    description: '27" изогнутый монитор, 144Hz, QHD',
    cost_price: 32000,
    is_active: true
  },
  {
    id: 3,
    name: 'Клавиатура Logitech MX Keys',
    sku: 'KEY-LOGI-MX-003',
    description: 'Беспроводная клавиатура для программистов',
    cost_price: 8900,
    is_active: true
  },
  {
    id: 4,
    name: 'Мышь Logitech MX Master 3',
    sku: 'MOUSE-LOGI-MX-004',
    description: 'Беспроводная мышь для работы',
    cost_price: 6500,
    is_active: true
  },
  {
    id: 5,
    name: 'SSD Samsung 1TB',
    sku: 'SSD-SAMS-1TB-005',
    description: 'Внутренний SSD накопитель 1TB',
    cost_price: 12000,
    is_active: false
  },
  {
    id: 6,
    name: 'Оперативная память Kingston 16GB',
    sku: 'RAM-KING-16-006',
    description: 'DDR4 3200MHz',
    cost_price: 5500,
    is_active: true
  },
  {
    id: 7,
    name: 'Видеокарта RTX 3060',
    sku: 'GPU-RTX-3060-007',
    description: '12GB GDDR6',
    cost_price: 42000,
    is_active: true
  },
  {
    id: 8,
    name: 'Блок питания Corsair 750W',
    sku: 'PSU-CORS-750-008',
    description: 'Модульный блок питания 80+ Gold',
    cost_price: 11500,
    is_active: true
  },
  {
    id: 9,
    name: 'Корпус NZXT H510',
    sku: 'CASE-NZXT-510-009',
    description: 'Mid-tower корпус с боковым стеклом',
    cost_price: 8900,
    is_active: true
  },
  {
    id: 10,
    name: 'Внешний HDD 2TB',
    sku: 'HDD-EXT-2TB-010',
    description: 'Внешний жесткий диск 2TB USB 3.0',
    cost_price: 5800,
    is_active: true
  },
];

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading] = useState(false);    // setLoading
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost_price: '',
    is_active: true,
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        cost_price: product.cost_price.toString(),
        is_active: product.is_active,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        cost_price: '',
        is_active: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      // Редактирование
      setProducts(products.map(p =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name,
              description: formData.description,
              cost_price: parseFloat(formData.cost_price),
              is_active: formData.is_active,
            }
          : p
      ));
    } else {
      // Создание нового
      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id)) + 1,
        name: formData.name,
        sku: `NEW-SKU-${Date.now()}`,
        description: formData.description,
        cost_price: parseFloat(formData.cost_price),
        is_active: formData.is_active,
      };
      setProducts([...products, newProduct]);
    }

    setModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
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
      width: '200px',
      render: (value: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'sku',
      title: 'SKU',
      width: '150px',
      render: (value: string) => (
        <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>
          {value}
        </span>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      width: '250px',
      render: (value: string) => value || '—',
    },
    {
      key: 'cost_price',
      title: 'Primary cost',
      width: '100px',
      render: (value: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <DollarSign size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
          <span>{formatPrice(value)}</span>
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
      key: 'actions',
      title: 'Actions',
      width: '100px',
      render: (_: any, record: Product) => (
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

  return (
    <div className="products-page">
      <div className="page-header">
        <h2>Products management</h2>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
        >
          <span>Create Product</span>
        </Button>
      </div>

      <Card className="filters-card">
        <div className="filters">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <Input
              placeholder="Search by title, desc or SKU-id"
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
          data={paginatedProducts}
          loading={loading}
          pagination={{
            current: page,
            total: filteredProducts.length,
            pageSize,
            onChange: setPage,
          }}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Редактировать товар' : 'Новый товар'}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Отмена
            </Button>
            <Button variant="primary" type="submit" form="product-form">
              {editingProduct ? 'Сохранить' : 'Создать'}
            </Button>
          </>
        }
      >
        <form id="product-form" className="product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название товара *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название товара"
              required
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              className="textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Введите описание товара"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Себестоимость *</label>
            <Input
              type="number"
              value={formData.cost_price}
              onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
              placeholder="Введите себестоимость"
              min="0"
              step="0.01"
              required
            />
          </div>

          {editingProduct && (
            <div className="form-group">
              <label>SKU</label>
              <Input
                value={editingProduct.sku}
                disabled
                className="readonly"
              />
              <small className="hint">SKU генерируется автоматически</small>
            </div>
          )}

          <div className="checkbox-group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>Is active</span>
            </label>
          </div>
        </form>
      </Modal>

      <style>{`
        .products-page {
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

        .actions {
          display: flex;
          gap: 8px;
        }

        .product-form {
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

        .readonly {
          opacity: 0.7;
          cursor: not-allowed;
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
      `}</style>
    </div>
  );
};

export default Products;