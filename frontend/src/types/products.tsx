export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  cost_price: number;
  is_active: boolean;
}
