from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from app.crud.base import CRUDBase
from app.models.inventory import Inventory
from app.models.product import Product
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryAdjustment, InventoryFilterParams


class CRUDInventory(CRUDBase[Inventory, InventoryCreate, InventoryUpdate]):

    def get_by_warehouse_and_product(
            self, db: Session, *, warehouse_id: int, product_id: int
    ) -> Optional[Inventory]:
        """Получить запись инвентаря для конкретного склада и товара"""
        return db.query(Inventory).filter(
            Inventory.warehouse_id == warehouse_id,
            Inventory.product_id == product_id
        ).first()

    def get_with_product(
            self, db: Session, *, id: int
    ) -> Optional[Inventory]:
        """Получить запись инвентаря с данными о товаре"""
        return db.query(Inventory).options(
            joinedload(Inventory.product)
        ).filter(Inventory.id == id).first()

    def get_multi_by_warehouse(
            self,
            db: Session,
            *,
            warehouse_id: int,
            skip: int = 0,
            limit: int = 100,
            filters: Optional[InventoryFilterParams] = None
    ) -> Tuple[List[Inventory], int]:
        """
        Получить инвентарь склада с пагинацией и фильтрацией
        Возвращает (список, общее_количество)
        """
        query = db.query(Inventory).options(
            joinedload(Inventory.product)
        ).filter(Inventory.warehouse_id == warehouse_id)

        if filters:
            if filters.search:
                query = query.join(Inventory.product).filter(
                    or_(
                        Product.name.ilike(f"%{filters.search}%"),
                        Product.sku.ilike(f"%{filters.search}%")
                    )
                )

            if filters.product_id:
                query = query.filter(Inventory.product_id == filters.product_id)

            if filters.in_stock_only:
                query = query.filter(Inventory.quantity > 0)

            if filters.low_stock_only:
                query = query.filter(
                    and_(
                        Inventory.quantity > 0,
                        Inventory.quantity < filters.low_stock_threshold
                    )
                )

        total = query.count()

        items = query.order_by(
            Inventory.product_id
        ).offset(skip).limit(limit).all()

        return items, total

    def adjust_quantity(
            self,
            db: Session,
            *,
            warehouse_id: int,
            product_id: int,
            adjustment: InventoryAdjustment
    ) -> Inventory:
        """
        Изменить количество товара на складе (приход/расход)
        Положительное adjustment = добавление, отрицательное = списание
        """
        inventory = self.get_by_warehouse_and_product(
            db, warehouse_id=warehouse_id, product_id=product_id
        )

        if not inventory:
            # Если записи нет, создаем (только для положительного adjustment)
            if adjustment.adjustment < 0:
                raise ValueError("Cannot decrease non-existing inventory")

            inventory = Inventory(
                warehouse_id=warehouse_id,
                product_id=product_id,
                quantity=adjustment.adjustment
            )
            db.add(inventory)
        else:
            # Проверяем, что не уходим в минус
            new_quantity = inventory.quantity + adjustment.adjustment
            if new_quantity < 0:
                raise ValueError(
                    f"Insufficient stock. Available: {inventory.quantity}, "
                    f"Requested decrease: {abs(adjustment.adjustment)}"
                )

            inventory.quantity = new_quantity
            inventory.updated_at = func.now()

        db.commit()
        db.refresh(inventory)
        return inventory

    def add_from_supply(
            self, db: Session, *, warehouse_id: int, product_id: int, quantity: int
    ) -> Inventory:
        """Добавить товар от поставки"""
        return self.adjust_quantity(
            db,
            warehouse_id=warehouse_id,
            product_id=product_id,
            adjustment=InventoryAdjustment(adjustment=quantity, reason="supply")
        )

    def remove_for_order(
            self, db: Session, *, warehouse_id: int, product_id: int, quantity: int
    ) -> Inventory:
        """Списать товар для заказа"""
        return self.adjust_quantity(
            db,
            warehouse_id=warehouse_id,
            product_id=product_id,
            adjustment=InventoryAdjustment(adjustment=-quantity, reason="order")
        )

    def get_low_stock_items(
            self, db: Session, *, warehouse_id: int, threshold: int = 10
    ) -> List[Inventory]:
        """Получить товары с малым остатком"""
        return db.query(Inventory).options(
            joinedload(Inventory.product)
        ).filter(
            Inventory.warehouse_id == warehouse_id,
            Inventory.quantity > 0,
            Inventory.quantity < threshold
        ).all()


inventory = CRUDInventory(Inventory)
