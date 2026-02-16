from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date

from app.api import deps

from app.crud.supply import supply, supply_item
from app.crud.warehouse import warehouse

from app.schemas.supply import (
    SupplyCreate, SupplyUpdate, SupplyResponse, SupplyList,
    SupplyItemCreate, SupplyItemUpdate, SupplyItemResponse,
    SupplyFilterParams
)

from app.models.user import User


router = APIRouter()


# - - - EMPLOYEE ROUTES - - - #


@router.post("/", response_model=SupplyResponse, status_code=status.HTTP_201_CREATED)
def create_supply(
        *,
        db: Session = Depends(deps.get_db),
        supply_in: SupplyCreate,
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new supply
    Available: employee of current warehouse
    """
    warehouse_obj = warehouse.get(db, id=supply_in.warehouse_id)
    if not warehouse_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found",
        )

    # is_superuser = current_user.is_superuser
    is_employee = current_user.warehouse_id == supply_in.warehouse_id

    if not is_employee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    # Проверяем, что все товары существуют
    # (можно добавить отдельную проверку)

    supply_obj = supply.create_with_items(db, obj_in=supply_in)
    return supply_obj


@router.get("/{supply_id}", response_model=SupplyResponse)
def read_supply(
        *,
        db: Session = Depends(deps.get_db),
        supply_id: int,
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get supply by supply_id
    Available: admin or employee of current warehouse
    """
    supply_obj = supply.get_with_items(db, id=supply_id)
    if not supply_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supply not found",
        )

    is_superuser = current_user.is_superuser
    is_employee = current_user.warehouse_id == supply_obj.warehouse_id

    if not (is_superuser or is_employee):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supply not found",
        )

    return supply_obj


@router.delete("/{supply_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supply(
        *,
        db: Session = Depends(deps.get_db),
        supply_id: int,
        current_user: User = Depends(deps.get_current_user),
) -> None:
    """
    Remove supply by supply_id (inventory is cleaning up)
    Available: admin or employee of current warehouse
    """
    supply_obj = supply.get(db, id=supply_id)
    if not supply_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supply not found",
        )

    # Проверка прав
    is_superuser = current_user.is_superuser
    is_employee = current_user.warehouse_id == supply_obj.warehouse_id

    if not (is_superuser or is_employee):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supply not found",
        )

    supply.delete_with_items(db, db_obj=supply_obj)
    return None


@router.get("/warehouses/{warehouse_id}/supplies", response_model=SupplyList)
def read_warehouse_supplies(
        *,
        db: Session = Depends(deps.get_db),
        warehouse_id: int,
        page: int = Query(1, ge=1, description="Номер страницы"),
        per_page: int = Query(20, ge=1, le=100, description="Элементов на странице"),
        search: Optional[str] = Query(None, description="Поиск по номеру поставки"),
        date_from: Optional[date] = Query(None, description="Начальная дата (ГГГГ-ММ-ДД)"),
        date_to: Optional[date] = Query(None, description="Конечная дата (ГГГГ-ММ-ДД)"),
        product_id: Optional[int] = Query(None, description="Фильтр по товару"),
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Получить все поставки склада с пагинацией и фильтрацией.
    Доступно: админам ИЛИ сотрудникам этого склада.
    """
    # Проверка доступа к складу
    warehouse_obj = warehouse.get(db, id=warehouse_id)
    if not warehouse_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found",
        )

    is_superuser = current_user.is_superuser
    is_employee = current_user.warehouse_id == warehouse_id

    if not (is_superuser or is_employee):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found",
        )

    # Пагинация
    skip = (page - 1) * per_page

    # Фильтры
    filters = SupplyFilterParams(
        search=search,
        date_from=date_from,
        date_to=date_to,
        product_id=product_id
    )

    supplies, total = supply.get_multi_by_warehouse(
        db,
        warehouse_id=warehouse_id,
        skip=skip,
        limit=per_page,
        filters=filters
    )

    # Добавляем название склада для удобства
    for s in supplies:
        s.warehouse_name = warehouse_obj.name

    return {
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page,
        "per_page": per_page,
        "supplies": supplies
    }


@router.get("/warehouses/my/supplies", response_model=SupplyList)
def read_my_warehouse_supplies(
        *,
        db: Session = Depends(deps.get_db),
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        search: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        product_id: Optional[int] = None,
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all supplies of my warehouse
    Available: employee of current warehouse
    """
    if not current_user.warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not assigned to any warehouse",
        )

    return read_warehouse_supplies(
        db=db,
        warehouse_id=current_user.warehouse_id,
        page=page,
        per_page=per_page,
        search=search,
        date_from=date_from,
        date_to=date_to,
        product_id=product_id,
        current_user=current_user
    )


# - - - ЭНДПОИНТЫ ДЛЯ ПОЗИЦИЙ ПОСТАВКИ - - - #


# @router.patch("/supply-items/{item_id}", response_model=SupplyItemResponse)
# def update_supply_item(
#         *,
#         db: Session = Depends(deps.get_db),
#         item_id: int,
#         item_in: SupplyItemUpdate,
#         current_user: User = Depends(deps.get_current_user),
# ) -> Any:
#     """
#     Обновить количество в позиции поставки.
#     Доступно: админам ИЛИ сотрудникам склада.
#     """
#     item_obj = supply_item.get(db, id=item_id)
#     if not item_obj:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Supply item not found",
#         )
#
#     # Проверка прав
#     is_superuser = current_user.is_superuser
#     is_employee = current_user.warehouse_id == item_obj.supply.warehouse_id
#
#     if not (is_superuser or is_employee):
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Supply item not found",
#         )
#
#     if item_in.quantity is None:
#         return item_obj
#
#     updated_item = supply_item.update_quantity_and_inventory(
#         db, db_obj=item_obj, new_quantity=item_in.quantity
#     )
#     return updated_item


@router.delete("/supply-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supply_item(
        *,
        db: Session = Depends(deps.get_db),
        item_id: int,
        current_user: User = Depends(deps.get_current_user),
) -> None:
    """
    Удалить позицию из поставки (уменьшает инвентарь).
    Доступно: админам ИЛИ сотрудникам склада.
    """
    item_obj = supply_item.get(db, id=item_id)
    if not item_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supply item not found",
        )

    # Проверка прав
    is_superuser = deps.is_superuser(current_user)
    is_employee = current_user.warehouse_id == item_obj.supply.warehouse_id

    if not (is_superuser or is_employee):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supply item not found",
        )

    supply_item.delete_with_inventory(db, db_obj=item_obj)
    return None
