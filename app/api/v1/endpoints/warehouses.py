from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session


from app.api import deps

from app.crud.warehouse import warehouse
# from app.crud.user import user

from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse, WarehouseList

from app.models.user import User
from app.models.warehouse import Warehouse


router = APIRouter()


# - - - ADMIN ROUTES - - - #


@router.post("/", response_model=WarehouseResponse)
def create_warehouse(
        *,
        db: Session = Depends(deps.get_db),
        warehouse_in: WarehouseCreate,
        current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new warehouse [RAW JSON]
    Available: admin
    """
    warehouse_obj = warehouse.create_with_users(db, obj_in=warehouse_in)
    return warehouse_obj


@router.put("/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(
        *,
        db: Session = Depends(deps.get_db),
        warehouse_id: int,
        warehouse_in: WarehouseUpdate,
        current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update existing warehouse [RAW JSON]
    Available: admin
    """
    warehouse_obj = warehouse.get(db, id=warehouse_id)
    if not warehouse_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found",
        )

    warehouse_obj = warehouse.update_with_users(db, db_obj=warehouse_obj, obj_in=warehouse_in)
    return warehouse_obj


@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_warehouse(
        *,
        db: Session = Depends(deps.get_db),
        warehouse_id: int,
        current_user: User = Depends(deps.get_current_active_superuser),
) -> None:
    """
    Delete existing warehouse by warehouse_id [RAW JSON]
    Available: admin
    """
    warehouse_obj = warehouse.get(db, id=warehouse_id)
    if not warehouse_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found",
        )

    if warehouse_obj.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete warehouse with assigned employees. Remove employees first.",
        )

    warehouse.remove(db, row_id=warehouse_id)
    return None


@router.get("/", response_model=WarehouseList)
def get_warehouses(
        *,
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None,
        current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get all warehouses with pagination [RAW JSON]
    Available: admin
    """
    warehouses = warehouse.get_multi_with_users(
        db, skip=skip, limit=limit, is_active=is_active
    )
    total = db.query(Warehouse).count()

    return {
        "total": total,
        "warehouses": warehouses
    }


# - - - /END ADMIN ROUTES - - - #


# - - - USER ROUTES - - - #


@router.get("/my", response_model=WarehouseResponse)
def get_my_warehouse(
        *,
        db: Session = Depends(deps.get_db),
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get my warehouse [RAW JSON]
    Available: employee
    """
    if not current_user.warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not assigned to any warehouse",
        )

    warehouse_obj = warehouse.get_with_users(db, id=current_user.warehouse.id)
    return warehouse_obj


@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse_by_id(
        *,
        db: Session = Depends(deps.get_db),
        warehouse_id: int,
        current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get warehouse [RAW JSON]
    Available: admin
    """
    warehouse_obj = warehouse.get_with_users(db, id=warehouse_id)
    if not warehouse_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found",
        )

    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found",
        )

    return warehouse_obj


# - - - /END USER ROUTES - - - #
