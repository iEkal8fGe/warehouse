from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.order import order
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.models.user import User


router = APIRouter(prefix="/external/orders", tags=["external-orders"])


@router.post("/sync", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def sync_order_from_external(
        *,
        db: Session = Depends(deps.get_db),
        order_in: OrderCreate,
        # API ключ для внешних систем
        api_key: str = Depends(deps.verify_external_api_key),
) -> Any:
    """
    ВНЕШНИЙ API: Создать или обновить заказ из внешней системы.
    Требует валидный API ключ.
    """
    order_obj = order.create_from_external(db, obj_in=order_in)
    return order_obj


@router.patch("/sync-status", response_model=OrderResponse)
def sync_order_status(
        *,
        db: Session = Depends(deps.get_db),
        status_update: OrderStatusUpdate,
        api_key: str = Depends(deps.verify_external_api_key),
) -> Any:
    """
    ВНЕШНИЙ API: Обновить статус заказа.
    """
    order_obj = order.sync_from_external(
        db,
        external_order_id=status_update.external_order_id,
        status_code=status_update.status_code,
        updated_at=status_update.updated_at
    )

    if not order_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return order_obj


@router.delete("/sync/{external_order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order_from_external(
        *,
        db: Session = Depends(deps.get_db),
        external_order_id: str,
        api_key: str = Depends(deps.verify_external_api_key),
) -> None:
    """
    ВНЕШНИЙ API: Удалить заказ (при отмене во внешней системе).
    """
    deleted = order.delete_from_external(db, external_order_id=external_order_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return None


@router.get("/sync/{external_order_id}", response_model=OrderResponse)
def get_order_status_external(
        *,
        db: Session = Depends(deps.get_db),
        external_order_id: str,
        api_key: str = Depends(deps.verify_external_api_key),
) -> Any:
    """
    ВНЕШНИЙ API: Получить информацию о заказе по ID внешней системы.
    """
    order_obj = order.get_by_external_id(db, external_order_id=external_order_id)

    if not order_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return order_obj
