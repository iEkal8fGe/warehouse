from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserResponse  # для вложенного ответа


class WarehouseBase(BaseModel):
    name: str
    state: str
    city: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = True


class WarehouseCreate(WarehouseBase):
    user_ids: Optional[List[int]] = []  # опционально, сразу привязать сотрудников


class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    user_ids: Optional[List[int]] = None  # полная замена списка сотрудников


class WarehouseInDB(WarehouseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class WarehouseResponse(WarehouseInDB):
    users: List[UserResponse] = []  # вложенные пользователи

    model_config = ConfigDict(from_attributes=True)


class WarehouseList(BaseModel):
    total: int
    warehouses: List[WarehouseResponse]
