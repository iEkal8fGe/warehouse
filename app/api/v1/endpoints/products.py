from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud
from app.api import deps
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.user import UserInDB


router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
def read_products(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserInDB = Depends(deps.get_current_user),
) -> Any:
    """
    Получить список товаров
    """
    products = crud.product.get_products(
        db, owner_id=current_user.id, skip=skip, limit=limit
    )
    return products


@router.post("/", response_model=ProductResponse)
def create_product(
    *,
    db: Session = Depends(deps.get_db),
    product_in: ProductCreate,
    current_user: UserInDB = Depends(deps.get_current_user),
) -> Any:
    """
    Создать новый товар
    """
    product = crud.product.create_product(
        db, obj_in=product_in, owner_id=current_user.id
    )
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    product_in: ProductUpdate,
    current_user: UserInDB = Depends(deps.get_current_user),
) -> Any:
    """
    Обновить товар
    """
    product = crud.product.get_by_id(db, product_id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    if product.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    product = crud.product.update(db, db_obj=product, obj_in=product_in)
    return product


@router.delete("/{product_id}", response_model=ProductResponse)
def delete_product(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    current_user: UserInDB = Depends(deps.get_current_user),
) -> Any:
    """
    Удалить товар
    """
    product = crud.product.get(db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    if product.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    product = crud.product.remove(db, id=product_id)
    return product
