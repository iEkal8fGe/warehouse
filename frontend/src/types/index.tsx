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

export interface Order {
  id: number;
  order_number: string;
  status: string;
  customer_name: string;
  total_amount: number;
  created_at: string;
}