from pydantic import BaseModel, field_validator, Field, ConfigDict
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    sku_id: str
    description: Optional[str] = None
    price: float
    is_active: bool = True

    @field_validator('price')
    @classmethod
    def price_positive(cls, v) -> str:
        if v <= 0:
            raise ValueError('Price must be positive')
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku_id: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None


class ProductInDB(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ProductResponse(ProductInDB):
    model_config = ConfigDict(from_attributes=True)
