export interface User {
  id: number;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  warehouse_id?: number;
  created_at: string;
}

export interface UserCreate {
  username: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
  warehouse_id?: number;
}

export interface UserUpdate {
  username?: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  warehouse_id?: number;
}

// Api interfaces
export interface CreateUserDto {
  username: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
  warehouse_id?: number;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  warehouse_id?: number;
}
// End Api interfaces