from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.config import settings
from app.crud.user import user
from app.api import deps
from app.core.security import create_access_token
from app.schemas.user import Token, UserResponse


router = APIRouter()


@router.post("/login", response_model=Token)
def login_access_token(
        db: Session = Depends(deps.get_db),
        form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 совместимый токен логин, получить access token для дальнейших запросов
    """
    user_obj = user.authenticate(
        db, username=form_data.username, password=form_data.password
    )
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )
    elif not user_obj.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            data={"sub": user_obj.username}, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/register", response_model=UserResponse)
def register_user(
        *,
        db: Session = Depends(deps.get_db),
        username: str,
        email: str,
        password: str,
        full_name: str = None,
) -> Any:
    """
    Регистрация нового пользователя
    """
    # Проверка существующего пользователя
    existing_user = user.get_by_username(db, username=username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    existing_email = user.get_by_email(db, email=email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user_in = {
        "username": username,
        "email": email,
        "password": password,
        "full_name": full_name,
    }

    new_user = user.create(db, obj_in=user_in)
    return new_user


@router.get("/me", response_model=UserResponse)
def read_users_me(
        current_user: user.model = Depends(deps.get_current_user),
) -> Any:
    """
    Получить информацию о текущем пользователе
    """
    return current_user
