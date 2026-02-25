export interface CartItem {
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
}

export interface SupplyItem {
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
}

export interface Supply {
  id: number;
  supply_number: string;
  created_at: string;
  items: SupplyItem[];
}
