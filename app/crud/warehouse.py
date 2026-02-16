from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.crud.base import CRUDBase
from app.models.warehouse import Warehouse
from app.models.user import User
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate


class CRUDWarehouse(CRUDBase[Warehouse, WarehouseCreate, WarehouseUpdate]):

    def get_with_users(self, db: Session, *, id: int) -> Optional[Warehouse]:
        """Получить склад вместе с сотрудниками"""
        return db.query(Warehouse).options(
            joinedload(Warehouse.users)
        ).filter(Warehouse.id == id).first()

    def get_multi_with_users(
            self, db: Session, *, skip: int = 0, limit: int = 100, is_active: Optional[bool] = None
    ) -> List[Warehouse]:
        """Получить список складов с сотрудниками"""
        query = db.query(Warehouse).options(joinedload(Warehouse.users))

        if is_active is not None:
            query = query.filter(Warehouse.is_active == is_active)

        return query.offset(skip).limit(limit).all()

    def create_with_users(
            self, db: Session, *, obj_in: WarehouseCreate
    ) -> Warehouse:
        """Создать склад и привязать сотрудников"""
        db_obj = Warehouse(
            name=obj_in.name,
            state=obj_in.state,
            city=obj_in.city,
            description=obj_in.description,
            is_active=obj_in.is_active,
        )
        db.add(db_obj)
        db.flush()  # чтобы получить id

        # Привязываем сотрудников
        if obj_in.user_ids:
            users = db.query(User).filter(User.id.in_(obj_in.user_ids)).all()
            db_obj.users = users

        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_with_users(
            self, db: Session, *, db_obj: Warehouse, obj_in: WarehouseUpdate
    ) -> Warehouse:
        """Обновить склад и список сотрудников"""
        # Обновляем простые поля
        update_data = obj_in.model_dump(exclude_unset=True, exclude={'user_ids'})
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        # Обновляем сотрудников (полная замена списка)
        if 'user_ids' in obj_in.model_dump(exclude_unset=True):
            if obj_in.user_ids is not None:
                users = db.query(User).filter(User.id.in_(obj_in.user_ids)).all()
                db_obj.users = users
            else:
                db_obj.users = []  # очистить список

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user_id(self, db: Session, *, user_id: int) -> Optional[Warehouse]:
        """Получить склад сотрудника (если сотрудник привязан к одному складу)"""
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.warehouse:
            return user.warehouse
        return None

    def is_user_in_warehouse(self, db: Session, *, warehouse_id: int, user_id: int) -> bool:
        """Проверить, является ли пользователь сотрудником склада"""
        warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
        if not warehouse:
            return False
        return any(user.id == user_id for user in warehouse.users)


warehouse = CRUDWarehouse(Warehouse)
