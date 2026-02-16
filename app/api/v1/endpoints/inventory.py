# endpoints/inventory.py
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.api import deps

from app.crud.inventory import inventory
from app.crud.warehouse import warehouse

from app.schemas.inventory import (
    InventoryResponse, InventoryList, InventoryFilterParams,
    InventoryAdjustment
)

from app.models.user import User
from app.models.inventory import Inventory


router = APIRouter()


def check_warehouse_access(
        db: Session,
        warehouse_id: int,
        current_user: User,
        allow_admin: bool = True
) -> bool:
    """ to deps prob or crud send  ->"""
    warehouse_obj = warehouse.get(db, id=warehouse_id)
    if not warehouse_obj:
        return False

    if allow_admin and current_user.is_superuser:
        return True

    return current_user.warehouse_id == warehouse_id


@router.get("/my", response_model=InventoryList)
def read_my_inventory(
        *,
        db: Session = Depends(deps.get_db),
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        search: Optional[str] = None,
        in_stock_only: bool = False,
        low_stock_only: bool = False,
        low_stock_threshold: int = 10,
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """ my inv """
    if not current_user.warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not assigned to any warehouse",
        )

    skip = (page - 1) * per_page

    filters = InventoryFilterParams(
        search=search,
        in_stock_only=in_stock_only,
        low_stock_only=low_stock_only,
        low_stock_threshold=low_stock_threshold
    )

    items, total = inventory.get_multi_by_warehouse(
        db,
        warehouse_id=current_user.warehouse_id,
        skip=skip,
        limit=per_page,
        filters=filters
    )

    return {
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page,
        "per_page": per_page,
        "items": items
    }


@router.get("/warehouse/{warehouse_id}", response_model=InventoryList)
def read_warehouse_inventory(
        *,
        db: Session = Depends(deps.get_db),
        warehouse_id: int,
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        search: Optional[str] = None,
        in_stock_only: bool = False,
        low_stock_only: bool = False,
        low_stock_threshold: int = 10,
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get inventory of chosen warehouse
    """
    if not check_warehouse_access(db, warehouse_id, current_user):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found",
        )

    skip = (page - 1) * per_page

    filters = InventoryFilterParams(
        search=search,
        in_stock_only=in_stock_only,
        low_stock_only=low_stock_only,
        low_stock_threshold=low_stock_threshold
    )

    items, total = inventory.get_multi_by_warehouse(
        db,
        warehouse_id=warehouse_id,
        skip=skip,
        limit=per_page,
        filters=filters
    )

    return {
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page,
        "per_page": per_page,
        "items": items
    }
