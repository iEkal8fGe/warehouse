from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime, date
from app.schemas.product import ProductResponse
from app.schemas.warehouse import WarehouseResponse


# ----- Статусы заказов -----
class OrderStatusBase(BaseModel):
    name: str
    code: str  # new, confirmed, paid, processing, shipping, delivered, cancelled, refunded
    description: Optional[str] = None
    sort_order: int = 0


class OrderStatusCreate(OrderStatusBase):
    pass


class OrderStatusInDB(OrderStatusBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ----- Элементы заказа -----
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)  # цена на момент заказа


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)
    price: Optional[float] = Field(None, gt=0)


class OrderItemInDB(OrderItemBase):
    id: int
    order_id: int
    total_amount: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderItemResponse(OrderItemInDB):
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ----- Заказы -----
class OrderBase(BaseModel):
    external_order_id: str = Field(..., description="ID заказа во внешней системе")
    warehouse_id: int
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    shipping_address: str
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]
    subtotal: Optional[float] = None  # если внешняя система передает
    shipping_cost: Optional[float] = 0
    total_amount: Optional[float] = None  # если внешняя система передает


class OrderUpdate(BaseModel):
    """Для внутреннего использования (админ/сотрудник)"""
    status_id: Optional[int] = None
    notes: Optional[str] = None
    tracking_number: Optional[str] = None
    shipped_at: Optional[datetime] = None


class OrderStatusUpdate(BaseModel):
    """Для внешнего API - обновление статуса"""
    external_order_id: str
    status_code: str  # new, shipped, cancelled, etc.
    updated_at: Optional[datetime] = None


class OrderInDB(OrderBase):
    id: int
    order_number: str  # ORD-2026-00001
    status_id: int
    subtotal: float
    shipping_cost: float
    total_amount: float
    tracking_number: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime]
    shipped_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(OrderInDB):
    items: List[OrderItemResponse] = []
    status: Optional[OrderStatusInDB] = None
    warehouse_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrderList(BaseModel):
    total: int
    page: int
    pages: Optional[int] = None
    per_page: int
    orders: List[OrderResponse]


# ----- Фильтры для пагинации -----
class OrderFilterParams(BaseModel):
    search: Optional[str] = None  # поиск по external_order_id, customer_name, shipping_address
    status_code: Optional[str] = None
    warehouse_id: Optional[int] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    is_shipped: Optional[bool] = None

    class Config:
        extra = "forbid"
