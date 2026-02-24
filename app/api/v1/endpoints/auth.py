from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.config import settings
from app.crud.user import user
from app.api import deps
from app.core.security import create_access_token
from app.schemas.user import UserBase

from datetime import timedelta
from typing import Any


router = APIRouter()


@router.post("/login")
def login_access_token(
        response: Response,
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
    access_token = create_access_token(
        subject=user_obj.username,
        expires_delta=access_token_expires
    )

    # HttpOnly Set cookie for jwt
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # Недоступен из JavaScript
        secure=False,   # secure=True,  # Только по HTTPS (в продакшне)
        samesite="lax",  # Защита от CSRF
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",  # Доступен для всех путей
    )

    return {
        "user": {
            "id": user_obj.id,
            "username": user_obj.username,
            "role": "admin" if user_obj.is_superuser else "employee",
            "warehouse_id": user_obj.warehouse_id
        }
    }


@router.get("/me", response_model=UserBase)
def read_users_me(
        current_user: UserBase = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user
    """
    return current_user


@router.post("/logout")
def logout(
        response: Response,
) -> Any:
    """
    Logout user - удаляем cookie
    """
    response.delete_cookie("access_token", path="/")
    return {"message": "Successfully logged out"}
