from app.config import settings
from app.models.user import User
from app.crud.user import user
from app.database import get_db
from app.schemas.user import TokenPayload

from fastapi import Depends, status, Security, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader

from datetime import datetime, timedelta
from typing import Optional

import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session


# - - - INTERNAL API DEPENDENCIES - - - #


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


async def get_token_from_cookie(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return token


async def get_current_user(
        db: Session = Depends(get_db),
        token: str = Depends(get_token_from_cookie)
) -> User:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    current_user = db.query(User).filter(User.username == username).first()
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return current_user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_active_superuser(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def is_superuser(current_user: User) -> bool:
    return current_user.is_superuser



def get_current_user_optional(
        db: Session = Depends(get_db),
        token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[user.model]:
    """
    Ret user if token-s valid
    """
    if token is None:
        return None

    try:
        return get_current_user(db, token)
    except HTTPException:
        return None


def create_access_token(
        data: dict,
        expires_delta: Optional[int] = None
) -> str:
    """
    Create JWT access token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now() + timedelta(seconds=expires_delta)
    else:
        expire = datetime.now() + timedelta(minutes=15)

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
