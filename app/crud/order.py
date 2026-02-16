from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from datetime import datetime, date

from app.crud.base import CRUDBase

from app.models.order import Order, OrderItem, OrderStatus
from app.models.inventory import Inventory

from app.schemas.order import OrderCreate, OrderUpdate, OrderItemCreate, OrderItemUpdate, OrderFilterParams, OrderStatusCreate, OrderStatusUpdate


class CRUDOrderStatus(CRUDBase[OrderStatus, OrderStatusCreate, OrderStatusUpdate]):

    def get_by_code(self, db: Session, *, code: str) -> Optional[OrderStatus]:
        return db.query(OrderStatus).filter(OrderStatus.code == code).first()

    def get_default_new_status(self, db: Session) -> Optional[OrderStatus]:
        """Получить статус 'new' (обычно id=1)"""
        return db.query(OrderStatus).filter(OrderStatus.code == "new").first()


class CRUDOrder(CRUDBase[Order, OrderCreate, OrderUpdate]):

    def generate_order_number(self, db: Session) -> str:
        """Генерирует уникальный номер заказа: ORD-YYYY-XXXXX"""
        year = datetime.now().year

        count = db.query(func.count(Order.id)).filter(
            func.extract('year', Order.created_at) == year
        ).scalar()

        next_num = count + 1
        return f"ORD-{year}-{next_num:05d}"

    def get_with_items(self, db: Session, *, id: int) -> Optional[Order]:
        """Получить заказ с позициями, товарами и статусом"""
        return db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.status),
            joinedload(Order.warehouse)
        ).filter(Order.id == id).first()

    def get_by_external_id(self, db: Session, *, external_order_id: str) -> Optional[Order]:
        """Получить заказ по ID внешней системы"""
        return db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.status)
        ).filter(Order.external_order_id == external_order_id).first()

    def create_from_external(
            self,
            db: Session,
            *,
            obj_in: OrderCreate
    ) -> Order:
        """
        Create order from external api
        проверка на дубликаты по external_order_id
        """
        existing = self.get_by_external_id(db, external_order_id=obj_in.external_order_id)
        if existing:
            return existing

        order_number = self.generate_order_number(db)

        new_status = db.query(OrderStatus).filter(OrderStatus.code == "new").first()

        subtotal = obj_in.subtotal or sum(item.quantity * item.price for item in obj_in.items)
        total = obj_in.total_amount or (subtotal + obj_in.shipping_cost)

        db_order = Order(
            order_number=order_number,
            external_order_id=obj_in.external_order_id,
            warehouse_id=obj_in.warehouse_id,
            status_id=new_status.id,
            customer_name=obj_in.customer_name,
            customer_email=obj_in.customer_email,
            customer_phone=obj_in.customer_phone,
            shipping_address=obj_in.shipping_address,
            notes=obj_in.notes,
            subtotal=subtotal,
            shipping_cost=obj_in.shipping_cost,
            total_amount=total
        )
        db.add(db_order)
        db.flush()

        # Создаем позиции
        for item in obj_in.items:
            db_item = OrderItem(
                order_id=db_order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
                total_amount=item.quantity * item.price
            )
            db.add(db_item)

        db.commit()
        db.refresh(db_order)
        return db_order

    def update_status(
            self,
            db: Session,
            *,
            db_obj: Order,
            status_code: str
    ) -> Order:
        """Обновить статус заказа"""
        status = db.query(OrderStatus).filter(OrderStatus.code == status_code).first()
        if not status:
            raise ValueError(f"Status '{status_code}' not found")

        db_obj.status_id = status.id
        db_obj.updated_at = func.now()

        # Если статус "shipped" - записываем дату отгрузки
        if status_code == "shipped":
            db_obj.shipped_at = func.now()

        # Если статус "cancelled" - освобождаем резервы (если были)
        if status_code == "cancelled":
            # TODO: вернуть зарезервированный товар в инвентарь
            pass

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def sync_from_external(
            self,
            db: Session,
            *,
            external_order_id: str,
            status_code: str,
            updated_at: Optional[datetime] = None
    ) -> Optional[Order]:
        """
        Синхронизировать статус заказа из внешней системы
        """
        order = self.get_by_external_id(db, external_order_id=external_order_id)
        if not order:
            return None

        # Проверяем, не новее ли наше обновление
        if updated_at and order.updated_at and updated_at <= order.updated_at:
            return order

        return self.update_status(db, db_obj=order, status_code=status_code)

    def delete_from_external(
            self,
            db: Session,
            *,
            external_order_id: str
    ) -> bool:
        """
        Удалить заказ по запросу из внешней системы
        """
        order = self.get_by_external_id(db, external_order_id=external_order_id)
        if not order:
            return False

        # TODO: вернуть товар в инвентарь если был зарезервирован

        db.delete(order)
        db.commit()
        return True

    def get_multi_filtered(
            self,
            db: Session,
            *,
            skip: int = 0,
            limit: int = 100,
            filters: Optional[OrderFilterParams] = None,
            warehouse_id: Optional[int] = None,  # для фильтрации по складу
            is_superuser: bool = False  # админ видит всё
    ) -> Tuple[List[Order], int]:
        """
        Получить заказы с пагинацией и фильтрацией
        """
        query = db.query(Order).options(
            joinedload(Order.status),
            joinedload(Order.warehouse)
        )

        # Фильтр по складу (для сотрудников)
        if warehouse_id and not is_superuser:
            query = query.filter(Order.warehouse_id == warehouse_id)

        # Применяем фильтры
        if filters:
            if filters.search:
                search_filter = or_(
                    Order.external_order_id.ilike(f"%{filters.search}%"),
                    Order.customer_name.ilike(f"%{filters.search}%"),
                    Order.shipping_address.ilike(f"%{filters.search}%"),
                    Order.order_number.ilike(f"%{filters.search}%")
                )
                query = query.filter(search_filter)

            if filters.status_code:
                query = query.join(OrderStatus).filter(
                    OrderStatus.code == filters.status_code
                )

            if filters.warehouse_id and is_superuser:  # админ может фильтровать по любому складу
                query = query.filter(Order.warehouse_id == filters.warehouse_id)

            if filters.date_from:
                query = query.filter(func.date(Order.created_at) >= filters.date_from)

            if filters.date_to:
                query = query.filter(func.date(Order.created_at) <= filters.date_to)

            if filters.is_shipped is not None:
                if filters.is_shipped:
                    query = query.filter(Order.shipped_at.isnot(None))
                else:
                    query = query.filter(Order.shipped_at.is_(None))

        total = query.count()
        orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

        # Загружаем позиции отдельно для избежания N+1
        for order in orders:
            items = db.query(OrderItem).options(
                joinedload(OrderItem.product)
            ).filter(OrderItem.order_id == order.id).all()
            order.items = items

        return orders, total


class CRUDOrderItem(CRUDBase[OrderItem, OrderItemCreate, OrderItemUpdate]):

    def create_with_order(
            self, db: Session, *, order_id: int, obj_in: OrderItemCreate
    ) -> OrderItem:
        db_item = OrderItem(
            order_id=order_id,
            product_id=obj_in.product_id,
            quantity=obj_in.quantity,
            price=obj_in.price,
            total_amount=obj_in.quantity * obj_in.price
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item


order_status = CRUDOrderStatus(OrderStatus)
order = CRUDOrder(Order)
order_item = CRUDOrderItem(OrderItem)
