from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app import crud, schemas
from app.api import deps
from app.schemas.user import UserResponse, UserCreate, UserUpdate, UserList, UserInDB


router = APIRouter()


@router.get("/users", response_model=UserList)
def read_users(
        db: Session = Depends(deps.get_db),
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=100),
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Получить список пользователей (только для админов)
    """
    users = crud.user.get_multi(db, skip=skip, limit=limit)
    total = db.query(crud.user.model).count()

    return {
        "total": total,
        "users": users
    }


@router.post("/users", response_model=UserResponse)
def create_user(
        *,
        db: Session = Depends(deps.get_db),
        user_in: UserCreate,
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Создать нового пользователя (только для админов)
    """
    # Проверяем существующего пользователя
    user = crud.user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким именем уже существует",
        )

    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует",
        )

    user = crud.user.create(db, obj_in=user_in)
    return user


@router.get("/users/{user_id}", response_model=UserResponse)
def read_user_by_id(
        user_id: int,
        db: Session = Depends(deps.get_db),
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Получить пользователя по ID (только для админов)
    """
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
        *,
        db: Session = Depends(deps.get_db),
        user_id: int,
        user_in: UserUpdate,
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Обновить пользователя (только для админов)
    """
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    # Проверяем email на уникальность
    if user_in.email and user_in.email != user.email:
        existing_user = crud.user.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует",
            )

    user = crud.user.update(db, db_obj=user, obj_in=user_in)
    return user


@router.delete("/users/{user_id}", response_model=UserResponse)
def delete_user(
        *,
        db: Session = Depends(deps.get_db),
        user_id: int,
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Удалить пользователя (только для админов)
    """
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    # Нельзя удалить себя
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя удалить свой аккаунт",
        )

    user = crud.user.remove(db, id=user_id)
    return user


@router.put("/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
        *,
        db: Session = Depends(deps.get_db),
        user_id: int,
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Включить/выключить пользователя (только для админов)
    """
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    # Нельзя деактивировать себя
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя деактивировать свой аккаунт",
        )

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
