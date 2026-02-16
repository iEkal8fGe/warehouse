from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.schemas.product import ProductResponse


class InventoryBase(BaseModel):
    warehouse_id: int
    product_id: int
    quantity: int = Field(..., ge=0, description="Текущее количество")


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=0, description="Новое количество")

    @field_validator('quantity')
    @classmethod
    def validate_quantity(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError('Quantity cannot be negative')
        return v


class InventoryAdjustment(BaseModel):
    """Для изменения количества (приход/расход)"""
    adjustment: int = Field(..., description="Положительное = приход, отрицательное = расход")
    reason: Optional[str] = None  # причина: supply, order, write_off, etc.


class InventoryInDB(InventoryBase):
    id: int
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class InventoryResponse(InventoryInDB):
    """Ответ с данными о товаре на складе"""
    product: Optional[ProductResponse] = None
    warehouse_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class InventoryList(BaseModel):
    """Список с пагинацией"""
    total: int
    page: int
    pages: Optional[int] = None
    per_page: int
    items: List[InventoryResponse]


class InventoryFilterParams(BaseModel):
    """Параметры фильтрации инвентаря"""
    search: Optional[str] = Field(None, description="Поиск по названию товара или SKU")
    product_id: Optional[int] = None
    in_stock_only: Optional[bool] = Field(False, description="Только товары в наличии (>0)")
    low_stock_only: Optional[bool] = Field(False, description="Только товары с малым остатком (можно задать порог)")
    low_stock_threshold: Optional[int] = Field(10, description="Порог малого остатка")

    model_config = ConfigDict(extra="forbid")
