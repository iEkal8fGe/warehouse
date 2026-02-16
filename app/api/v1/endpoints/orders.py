from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from app.api import deps
from app.crud.order import order
from app.crud.warehouse import warehouse
from app.schemas.order import (
    OrderResponse, OrderList, OrderUpdate,
    OrderFilterParams, OrderStatusUpdate
)
from app.models.user import User


router = APIRouter()


# - - - ADMIN ENDPOINTS - - - #


@router.get("/admin/all", response_model=OrderList)
def read_all_orders_admin(
        *,
        db: Session = Depends(deps.get_db),
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        search: Optional[str] = Query(None, description="Поиск по номеру, клиенту, адресу"),
        status_code: Optional[str] = Query(None, description="Фильтр по статусу"),
        warehouse_id: Optional[int] = Query(None, description="Фильтр по складу"),
        date_from: Optional[date] = Query(None),
        date_to: Optional[date] = Query(None),
        is_shipped: Optional[bool] = Query(None, description="Отгружен/не отгружен"),
        current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Получить ВСЕ заказы с пагинацией и фильтрацией (только админ).
    """
    skip = (page - 1) * per_page

    filters = OrderFilterParams(
        search=search,
        status_code=status_code,
        warehouse_id=warehouse_id,
        date_from=date_from,
        date_to=date_to,
        is_shipped=is_shipped
    )

    orders, total = order.get_multi_filtered(
        db,
        skip=skip,
        limit=per_page,
        filters=filters,
        is_superuser=True
    )

    return {
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page,
        "per_page": per_page,
        "orders": orders
    }


# - - - USER ENDPOINTS - - - #


@router.get("/warehouse/my", response_model=OrderList)
def read_my_warehouse_orders(
        *,
        db: Session = Depends(deps.get_db),
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        search: Optional[str] = Query(None, description="Поиск по номеру, клиенту, адресу"),
        status_code: Optional[str] = Query(None, description="Фильтр по статусу"),
        date_from: Optional[date] = Query(None),
        date_to: Optional[date] = Query(None),
        is_shipped: Optional[bool] = Query(None),
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Получить заказы своего склада (для сотрудника).
    """
    if not current_user.warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not assigned to any warehouse",
        )

    skip = (page - 1) * per_page

    filters = OrderFilterParams(
        search=search,
        status_code=status_code,
        date_from=date_from,
        date_to=date_to,
        is_shipped=is_shipped
    )

    orders, total = order.get_multi_filtered(
        db,
        skip=skip,
        limit=per_page,
        filters=filters,
        warehouse_id=current_user.warehouse_id,
        is_superuser=False
    )

    return {
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page,
        "per_page": per_page,
        "orders": orders
    }


@router.get("/warehouse/{warehouse_id}", response_model=OrderList)
def read_warehouse_orders(
        *,
        db: Session = Depends(deps.get_db),
        warehouse_id: int,
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        search: Optional[str] = None,
        status_code: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        is_shipped: Optional[bool] = None,
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Получить заказы конкретного склада.
    Доступно: админам ИЛИ сотрудникам этого склада.
    """
    # Проверка доступа
    warehouse_obj = warehouse.get(db, id=warehouse_id)
    if not warehouse_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found",
        )

    is_superuser = deps.is_superuser(current_user)
    is_employee = current_user.warehouse_id == warehouse_id

    if not (is_superuser or is_employee):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found",
        )

    skip = (page - 1) * per_page

    filters = OrderFilterParams(
        search=search,
        status_code=status_code,
        date_from=date_from,
        date_to=date_to,
        is_shipped=is_shipped
    )

    orders, total = order.get_multi_filtered(
        db,
        skip=skip,
        limit=per_page,
        filters=filters,
        warehouse_id=warehouse_id,
        is_superuser=is_superuser
    )

    return {
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page,
        "per_page": per_page,
        "orders": orders
    }


@router.get("/new", response_model=OrderList)
def read_new_orders(
        *,
        db: Session = Depends(deps.get_db),
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Получить новые заказы (статус 'new') для своего склада.
    """
    return read_my_warehouse_orders(
        db=db,
        page=page,
        per_page=per_page,
        status_code="new",
        current_user=current_user
    )


@router.patch("/{order_id}/ship", response_model=OrderResponse)
def ship_order(
        *,
        db: Session = Depends(deps.get_db),
        order_id: int,
        tracking_number: Optional[str] = Query(None, description="Трек-номер отправления"),
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Отметить заказ как отгруженный (статус -> shipped).
    Доступно: админам ИЛИ сотрудникам склада этого заказа.
    """
    order_obj = order.get_with_items(db, id=order_id)
    if not order_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Проверка прав
    is_superuser = deps.is_superuser(current_user)
    is_employee = current_user.warehouse_id == order_obj.warehouse_id

    if not (is_superuser or is_employee):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Проверка текущего статуса
    if order_obj.status and order_obj.status.code == "shipped":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order already shipped",
        )

    # Обновляем трек-номер если есть
    if tracking_number:
        order_obj.tracking_number = tracking_number

    # Меняем статус
    order_obj = order.update_status(db, db_obj=order_obj, status_code="shipped")

    return order_obj


@router.get("/{order_id}", response_model=OrderResponse)
def read_order(
        *,
        db: Session = Depends(deps.get_db),
        order_id: int,
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Получить детальную информацию о заказе.
    Доступно: админам ИЛИ сотрудникам склада этого заказа.
    """
    order_obj = order.get_with_items(db, id=order_id)
    if not order_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Проверка прав
    is_superuser = deps.is_superuser(current_user)
    is_employee = current_user.warehouse_id == order_obj.warehouse_id

    if not (is_superuser or is_employee):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Добавляем название склада для удобства
    if order_obj.warehouse:
        order_obj.warehouse_name = order_obj.warehouse.name

    return order_obj
