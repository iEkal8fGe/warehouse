from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from datetime import date, datetime

from app.crud.base import CRUDBase

from app.models.supply import Supply, SupplyItem
from app.models.inventory import Inventory

from app.schemas.supply import SupplyCreate, SupplyUpdate, SupplyItemUpdate, SupplyItemCreate, SupplyFilterParams


class CRUDSupply(CRUDBase[Supply, SupplyCreate, SupplyUpdate]):

    def generate_supply_number(self, db: Session) -> str:
        """Генерирует уникальный номер поставки: SUP-YYYY-XXXXX"""
        year = datetime.now().year

        # Считаем поставки за этот год
        count = db.query(func.count(Supply.id)).filter(
            func.extract('year', Supply.created_at) == year
        ).scalar()

        next_num = count + 1
        return f"SUP-{year}-{next_num:05d}"

    def get_with_items(self, db: Session, *, id: int) -> Optional[Supply]:
        """Получить поставку вместе с позициями и товарами"""
        return db.query(Supply).options(
            joinedload(Supply.items).joinedload(SupplyItem.product),
            joinedload(Supply.warehouse)
        ).filter(Supply.id == id).first()

    def get_multi_by_warehouse(
            self,
            db: Session,
            *,
            warehouse_id: int,
            skip: int = 0,
            limit: int = 100,
            filters: Optional[SupplyFilterParams] = None
    ) -> Tuple[List[Supply], int]:
        """
        Получить поставки склада с пагинацией и фильтрацией
        Возвращает (список, общее_количество)
        """
        query = db.query(Supply).filter(Supply.warehouse_id == warehouse_id)

        # Применяем фильтры
        if filters:
            if filters.search:
                query = query.filter(Supply.supply_number.ilike(f"%{filters.search}%"))

            if filters.date_from:
                query = query.filter(
                    func.date(Supply.created_at) >= filters.date_from
                )

            if filters.date_to:
                query = query.filter(
                    func.date(Supply.created_at) <= filters.date_to
                )

            if filters.product_id:
                # Подзапрос: поставки, содержащие указанный товар
                query = query.join(Supply.items).filter(
                    SupplyItem.product_id == filters.product_id
                ).distinct()

        # Считаем общее количество ДО пагинации
        total = query.count()

        # Загружаем с отношениями
        supplies = query.options(
            joinedload(Supply.items).joinedload(SupplyItem.product),
            joinedload(Supply.warehouse)
        ).order_by(Supply.created_at.desc()).offset(skip).limit(limit).all()

        return supplies, total

    def create_with_items(
            self,
            db: Session,
            *,
            obj_in: SupplyCreate,
            created_by_id: Optional[int] = None  # на будущее
    ) -> Supply:
        """Создать поставку с позициями и обновить инвентарь"""

        # Генерируем номер
        supply_number = self.generate_supply_number(db)

        # Создаем поставку
        db_supply = Supply(
            supply_number=supply_number,
            warehouse_id=obj_in.warehouse_id,
            notes=obj_in.notes
        )
        db.add(db_supply)
        db.flush()  # получаем id

        # Создаем позиции и обновляем инвентарь
        for item in obj_in.items:
            # Создаем позицию поставки
            db_item = SupplyItem(
                supply_id=db_supply.id,
                product_id=item.product_id,
                quantity=item.quantity
            )
            db.add(db_item)

            # Обновляем или создаем запись в инвентаре
            inventory = db.query(Inventory).filter(
                Inventory.warehouse_id == obj_in.warehouse_id,
                Inventory.product_id == item.product_id
            ).first()

            if inventory:
                inventory.quantity += item.quantity
                inventory.updated_at = func.now()
            else:
                inventory = Inventory(
                    warehouse_id=obj_in.warehouse_id,
                    product_id=item.product_id,
                    quantity=item.quantity
                )
                db.add(inventory)

        db.commit()
        db.refresh(db_supply)
        return db_supply

    def delete_with_items(self, db: Session, *, db_obj: Supply) -> None:
        """
        Удалить поставку и уменьшить инвентарь
        """
        # Уменьшаем инвентарь
        for item in db_obj.items:
            inventory = db.query(Inventory).filter(
                Inventory.warehouse_id == db_obj.warehouse_id,
                Inventory.product_id == item.product_id
            ).first()

            if inventory:
                inventory.quantity -= item.quantity
                if inventory.quantity < 0:
                    inventory.quantity = 0
                inventory.updated_at = func.now()

        # Удаляем поставку (позиции удалятся каскадно)
        db.delete(db_obj)
        db.commit()


class CRUDSupplyItem(CRUDBase[SupplyItem, SupplyItemCreate, SupplyItemUpdate]):

    def update_quantity_and_inventory(
            self,
            db: Session,
            *,
            db_obj: SupplyItem,
            new_quantity: int
    ) -> SupplyItem:
        """Обновить количество в позиции и инвентаре"""
        diff = new_quantity - db_obj.quantity

        # Обновляем инвентарь
        inventory = db.query(Inventory).filter(
            Inventory.warehouse_id == db_obj.supply.warehouse_id,
            Inventory.product_id == db_obj.product_id
        ).first()

        if inventory:
            inventory.quantity += diff
            inventory.updated_at = func.now()

        # Обновляем позицию
        db_obj.quantity = new_quantity
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete_with_inventory(self, db: Session, *, db_obj: SupplyItem) -> None:
        """Удалить позицию и уменьшить инвентарь"""
        # Уменьшаем инвентарь
        inventory = db.query(Inventory).filter(
            Inventory.warehouse_id == db_obj.supply.warehouse_id,
            Inventory.product_id == db_obj.product_id
        ).first()

        if inventory:
            inventory.quantity -= db_obj.quantity
            if inventory.quantity < 0:
                inventory.quantity = 0
            inventory.updated_at = func.now()

        # Удаляем позицию
        db.delete(db_obj)
        db.commit()


supply = CRUDSupply(Supply)
supply_item = CRUDSupplyItem(SupplyItem)
