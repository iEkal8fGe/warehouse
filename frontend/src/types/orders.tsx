export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;       // TODO: (maybe) merge into Product obj
  product_name?: string;    // TODO: (maybe) merge into Product obj
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
