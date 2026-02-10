from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.config import settings
from app.crud.user import user
from app.api import deps
from app.core.security import create_access_token
from app.schemas.user import Token, UserResponse, UserCreate


router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register_user(
        *,
        db: Session = Depends(deps.get_db),
        user_data: UserCreate
) -> Any:
    if user.get_by_username(db, username=user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    new_user = user.create(db, obj_in=user_data)
    return new_user


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


@router.get("/me", response_model=UserResponse)
def read_users_me(
        current_user: user.model = Depends(deps.get_current_user),
) -> Any:
    """
    Получить информацию о текущем пользователе
    """
    return current_user
