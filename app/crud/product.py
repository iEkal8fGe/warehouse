from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.crud.base import CRUDBase
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):

    def get_by_sku(self, db: Session, *, sku: str) -> Optional[Product]:
        """Получить товар по SKU"""
        return db.query(Product).filter(Product.sku == sku).first()

    def get_multi_active(
            self, db: Session, *, skip: int = 0, limit: int = 100, search: Optional[str] = None
    ) -> List[Product]:
        """Получить список активных товаров с поиском"""
        query = db.query(Product).filter(Product.is_active == True)

        if search:
            search_filter = or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)

        return query.offset(skip).limit(limit).all()

    def get_multi_all(
            self, db: Session, *, skip: int = 0, limit: int = 100,
            is_active: Optional[bool] = None, search: Optional[str] = None
    ) -> List[Product]:
        """Получить все товары (для админа) с фильтрацией"""
        query = db.query(Product)

        if is_active is not None:
            query = query.filter(Product.is_active == is_active)

        if search:
            search_filter = or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)

        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: ProductCreate) -> Product:
        """Создать товар с проверкой уникальности SKU"""
        db_obj = Product(
            name=obj_in.name,
            sku=obj_in.sku,
            description=obj_in.description,
            cost_price=obj_in.cost_price,
            is_active=obj_in.is_active,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
            self, db: Session, *, db_obj: Product, obj_in: ProductUpdate
    ) -> Product:
        update_data = obj_in.model_dump(exclude_unset=True)

        if 'sku' in update_data and update_data['sku'] != db_obj.sku:
            existing = self.get_by_sku(db, sku=update_data['sku'])
            if existing:
                raise ValueError(f"Product with SKU '{update_data['sku']}' already exists")

        return super().update(db, db_obj=db_obj, obj_in=obj_in)


product = CRUDProduct(Product)


# from sqlalchemy.orm import Session
# from typing import Optional
# from app.models.product import Product
# from app.schemas.product import ProductCreate, ProductUpdate
# from .base import CRUDBase
#
#
# class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
#     def get_by_id(self, db: Session, product_id: int) -> Optional[Product]:
#         return db.query(Product).filter(Product.id == product_id).first()
#
#     def get_by_sku(self, db: Session, sku_id: str) -> Optional[Product]:
#         return db.query(Product).filter(Product.sku_id == sku_id).first()
#
#     def get_products(self, db: Session, skip: int = 0, limit: int = 100):
#         return db.query(Product).offset(skip).limit(limit).all()
#
#     def create_product(self, db: Session, *, obj_in: ProductCreate):
#         db_obj = Product(
#             name=obj_in.name,
#             sku_id=obj_in.sku_id,
#             description=obj_in.description,
#             price=obj_in.price,
#             is_active=obj_in.is_active
#         )
#         db.add(db_obj)
#         db.commit()
#         db.refresh(db_obj)
#         return db_obj
#
#     def is_active(self, current_product: Product) -> bool:
#         return current_product.is_active
#
#
# product = CRUDProduct(Product)
