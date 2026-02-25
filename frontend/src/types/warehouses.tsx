import type { User } from "./users";

export interface Warehouse {
  id: number;
  name: string;
  state: string;
  city: string;
  is_active: boolean;
  description?: string;
  users?: User[];
}
