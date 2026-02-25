# app/api/deps.py
from app.config import settings
from app.models.user import User
from app.crud.user import user
from app.database import get_db
from app.schemas.user import TokenPayload

from fastapi import Depends, status, Security, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader

from datetime import datetime, timedelta
from typing import Optional

import jwt  # Это pyjwt, правильно
from pydantic import ValidationError
from sqlalchemy.orm import Session

# - - - INTERNAL API DEPENDENCIES - - - #


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False  # Не кидаем ошибку автоматически
)


async def get_token_from_cookie(request: Request) -> Optional[str]:
    """Получаем токен из cookie"""
    token = request.cookies.get("access_token")
    if token and token.startswith("Bearer "):
        token = token[7:]  # Убираем "Bearer " если есть
    return token


async def get_token_from_header(token: str = Depends(oauth2_scheme)) -> Optional[str]:
    """Получаем токен из заголовка Authorization"""
    return token


async def get_current_user(
    db: Session = Depends(get_db),
    request: Request = None,
    token_header: str = Depends(oauth2_scheme)
) -> User:
    # 1. Пробуем токен из cookie
    token = None
    if request:
        cookie_token = request.cookies.get("access_token")
        if cookie_token:
            if cookie_token.startswith("Bearer "):
                cookie_token = cookie_token[7:]
            token = cookie_token

    # 2. Если нет, пробуем из заголовка
    if not token and token_header:
        token = token_header

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    current_user = user.get_by_username(User.username)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not found")
    return current_user



async def get_current_user_optional(
        db: Session = Depends(get_db),
        request: Request = None,
        token_header: Optional[str] = Depends(oauth2_scheme)
) -> Optional[User]:
    """
    Опциональное получение пользователя (не кидает ошибку если нет токена)
    """
    try:
        return await get_current_user(db, request, token_header)
    except HTTPException:
        return None


async def get_current_active_user(
        current_user: User = Depends(get_current_user),
) -> User:
    """Получение активного пользователя"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_active_superuser(
        current_user: User = Depends(get_current_active_user),
) -> User:
    """Получение суперпользователя"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create JWT access token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def verify_token(token: str) -> Optional[TokenPayload]:
    """
    Проверяет токен и возвращает данные если токен валидный
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return TokenPayload(**payload)
    except (jwt.InvalidTokenError, ValidationError):
        return None


# - - - /END INTERNAL API DEPENDENCIES - - - #


# - - - EXTERNAL API DEPENDENCIES - - - #


# API Key for external
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_external_api_key(
        api_key: str = Security(api_key_header),
) -> str:
    """
    Проверка API ключа для внешних систем.
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key required",
        )

    # Проверяем из настроек
    valid_keys = settings.EXTERNAL_API_KEYS  # список ключей в .env

    if api_key not in valid_keys:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key",
        )

    return api_key

# - - - /END EXTERNAL API DEPENDENCIES - - - #