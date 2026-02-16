from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime, date
from app.schemas.product import ProductResponse


# ----- SupplyItem схемы -----
class SupplyItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class SupplyItemCreate(SupplyItemBase):
    pass


class SupplyItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)


class SupplyItemInDB(SupplyItemBase):
    id: int
    supply_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplyItemResponse(SupplyItemInDB):
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ----- Supply схемы -----
class SupplyBase(BaseModel):
    warehouse_id: int
    notes: Optional[str] = None


class SupplyCreate(SupplyBase):
    items: List[SupplyItemCreate]  # обязательные позиции при создании


class SupplyUpdate(BaseModel):
    notes: Optional[str] = None
    # items не обновляем через этот эндпоинт - отдельный эндпоинт для items


class SupplyInDB(SupplyBase):
    id: int
    supply_number: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplyResponse(SupplyInDB):
    items: List[SupplyItemResponse] = []
    warehouse_name: Optional[str] = None  # для удобства

    model_config = ConfigDict(from_attributes=True)


class SupplyList(BaseModel):
    total: int
    page: int
    pages: Optional[int] = None
    per_page: int
    supplies: List[SupplyResponse]


# ----- Фильтры для пагинации -----
class SupplyFilterParams(BaseModel):
    search: Optional[str] = None  # поиск по supply_number
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    product_id: Optional[int] = None  # опционально

    class Config:
        extra = "forbid"
