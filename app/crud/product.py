from sqlalchemy.orm import Session
from typing import Optional
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from .base import CRUDBase


class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_by_id(self, db: Session, product_id: int) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    def get_by_sku(self, db: Session, sku_id: str) -> Optional[Product]:
        return db.query(Product).filter(Product.sku_id == sku_id).first()

    def get_products(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(Product).offset(skip).limit(limit).all()

    def create_product(self, db: Session, *, obj_in: ProductCreate):
        db_obj = Product(
            name=obj_in.name,
            sku_id=obj_in.sku_id,
            description=obj_in.description,
            price=obj_in.price,
            is_active=obj_in.is_active
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def is_active(self, current_product: Product) -> bool:
        return current_product.is_active


product = CRUDProduct(Product)
