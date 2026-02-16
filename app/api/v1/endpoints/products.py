from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.api import deps

from app.crud.product import product

from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductList

from app.models.user import User
from app.models.product import Product


router = APIRouter()


# - - - ADMIN ROUTES - - - #


@router.post("/", response_model=ProductResponse)
def create_product(
        *,
        db: Session = Depends(deps.get_db),
        product_in: ProductCreate,
        current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """ Create new product [RAW JSON] """
    existing = product.get_by_sku(db, sku=product_in.sku)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_in.sku}' already exists",
        )

    product_obj = product.create(db, obj_in=product_in)
    return product_obj


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
        *,
        db: Session = Depends(deps.get_db),
        product_id: int,
        product_in: ProductUpdate,
        current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """ Update chosen product [RAW JSON] """
    product_obj = product.get(db, id=product_id)
    if not product_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    try:
        product_obj = product.update(db, db_obj=product_obj, obj_in=product_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return product_obj


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
        *,
        db: Session = Depends(deps.get_db),
        product_id: int,
        current_user: User = Depends(deps.get_current_active_superuser),
) -> None:
    product_obj = product.get(db, id=product_id)
    if not product_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    if product_obj.inventory_items:
        non_zero_inventory = [item for item in product_obj.inventory_items if item.quantity > 0]
        if non_zero_inventory:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete product with existing inventory. Deactivate it instead.",
            )

    product.remove(db, row_id=product_id)
    return None


@router.patch("/{product_id}/status", response_model=ProductResponse)
def toggle_product_active(
        *,
        db: Session = Depends(deps.get_db),
        product_id: int,
        current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    product_obj = product.get(db, id=product_id)
    if not product_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    product_obj.is_active = not product_obj.is_active
    db.add(product_obj)
    db.commit()
    db.refresh(product_obj)
    return product_obj


@router.get("/", response_model=ProductList)
def get_all_products(
        *,
        db: Session = Depends(deps.get_db),
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000),
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """ Get all products w filters [RAW JSON] """
    products = product.get_multi_all(
        db, skip=skip, limit=limit, is_active=is_active, search=search
    )
    total = db.query(Product).count()

    return {
        "total": total,
        "products": products
    }


# - - - USER ENDPOINTS - - - #


# @router.get("/products", response_model=ProductList)
# def read_products(
#         *,
#         db: Session = Depends(deps.get_db),
#         skip: int = Query(0, ge=0),
#         limit: int = Query(100, ge=1, le=100),
#         search: Optional[str] = None,
#         current_user: User = Depends(deps.get_current_user),
# ) -> Any:
#     """ only active products """
#     products = product.get_multi_active(db, skip=skip, limit=limit, search=search)
#     total = db.query(Product).filter(Product.is_active == True).count()
#
#     return {
#         "total": total,
#         "products": products
#     }


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
        *,
        db: Session = Depends(deps.get_db),
        product_id: int,
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    """ Get chosen product information """
    product_obj = product.get(db, id=product_id)
    if not product_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    if current_user.is_superuser:
        return product_obj

    if not product_obj.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product_obj


# @router.get("/", response_model=List[ProductResponse])
# def read_products(
#     db: Session = Depends(deps.get_db),
#     skip: int = 0,
#     limit: int = 100,
#     current_user: UserInDB = Depends(deps.get_current_user),
# ) -> Any:
#     """
#     Получить список товаров
#     """
#     products = crud.product.get_products(
#         db, owner_id=current_user.id, skip=skip, limit=limit
#     )
#     return products
#
#
# @router.post("/", response_model=ProductResponse)
# def create_product(
#     *,
#     db: Session = Depends(deps.get_db),
#     product_in: ProductCreate,
#     current_user: UserInDB = Depends(deps.get_current_user),
# ) -> Any:
#     """
#     Создать новый товар
#     """
#     product = crud.product.create_product(
#         db, obj_in=product_in, owner_id=current_user.id
#     )
#     return product
#
#
# @router.put("/{product_id}", response_model=ProductResponse)
# def update_product(
#     *,
#     db: Session = Depends(deps.get_db),
#     product_id: int,
#     product_in: ProductUpdate,
#     current_user: UserInDB = Depends(deps.get_current_user),
# ) -> Any:
#     """
#     Обновить товар
#     """
#     product = crud.product.get_by_id(db, product_id=product_id)
#     if not product:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Product not found"
#         )
#     if product.owner_id != current_user.id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Not enough permissions"
#         )
#     product = crud.product.update(db, db_obj=product, obj_in=product_in)
#     return product
#
#
# @router.delete("/{product_id}", response_model=ProductResponse)
# def delete_product(
#     *,
#     db: Session = Depends(deps.get_db),
#     product_id: int,
#     current_user: UserInDB = Depends(deps.get_current_user),
# ) -> Any:
#     """
#     Удалить товар
#     """
#     product = crud.product.get(db, id=product_id)
#     if not product:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Product not found"
#         )
#     if product.owner_id != current_user.id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Not enough permissions"
#         )
#     product = crud.product.remove(db, id=product_id)
#     return product
