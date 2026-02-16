from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    cost_price: float = Field(..., gt=0, description="Себестоимость")
    is_active: Optional[bool] = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    cost_price: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None


class ProductInDB(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class ProductResponse(ProductInDB):
    model_config = ConfigDict(from_attributes=True)


class ProductList(BaseModel):
    total: int
    products: List[ProductResponse]


class InventoryBase(BaseModel):
    warehouse_id: int
    product_id: int
    quantity: int = 0


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None


class InventoryInDB(InventoryBase):
    id: int
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class InventoryResponse(InventoryInDB):
    product: Optional[ProductResponse] = None  # вложенный товар

    model_config = ConfigDict(from_attributes=True)


class InventoryList(BaseModel):
    total: int
    items: List[InventoryResponse]


# from pydantic import BaseModel, field_validator, Field, ConfigDict
# from typing import Optional
# from datetime import datetime
#
#
# class ProductBase(BaseModel):
#     name: str
#     sku_id: str
#     description: Optional[str] = None
#     price: float
#     is_active: bool = True
#
#     @field_validator('price')
#     @classmethod
#     def price_positive(cls, v) -> str:
#         if v <= 0:
#             raise ValueError('Price must be positive')
#         return v
#
#
# class ProductCreate(ProductBase):
#     pass
#
#
# class ProductUpdate(BaseModel):
#     name: Optional[str] = None
#     sku_id: Optional[str] = None
#     description: Optional[str] = None
#     price: Optional[float] = None
#     is_active: Optional[bool] = None
#
#
# class ProductInDB(ProductBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime]
#
#     class Config:
#         from_attributes = True
#
#
# class ProductResponse(ProductInDB):
#     model_config = ConfigDict(from_attributes=True)
