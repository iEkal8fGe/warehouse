export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  warehouse_id?: number;
  created_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  state: string;
  city: string;
  is_active: boolean;
  description?: string;
  users?: User[];
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  cost_price: number;
  is_active: boolean;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  external_order_id?: string;
  warehouse_id: number;
  status_id: number;
  postal_code: string;
  country: string;
  city: string;
  address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  items: OrderItem[];
}