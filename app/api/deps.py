from datetime import datetime
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt import InvalidTokenError, ExpiredSignatureError, DecodeError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.config import settings
from app.crud.user import user
from app.database import get_db
from app.schemas.user import TokenPayload


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_current_user(
        db: Session = Depends(get_db),
        token: str = Depends(oauth2_scheme)
) -> user.model:
    """
    Получает текущего пользователя из JWT токена
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Декодируем JWT токен
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Проверяем expiration time если есть
        exp = payload.get("exp")
        if exp:
            if datetime.fromtimestamp(exp) < datetime.now():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expired",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        # Валидируем через Pydantic
        token_data = TokenPayload(**payload)

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except DecodeError:
        raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception
    except ValidationError:
        raise credentials_exception
    except Exception:
        raise credentials_exception

    # Получаем пользователя
    user_obj = user.get_by_username(db, username=token_data.sub)
    if user_obj is None:
        raise credentials_exception

    if not user_obj.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    return user_obj


def get_current_active_user(
        current_user: user.model = Depends(get_current_user),
) -> user.model:
    """
    Проверяет, что пользователь активен
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


def get_current_active_superuser(
        current_user: user.model = Depends(get_current_user),
) -> user.model:
    """
    Проверяет, что пользователь суперюзер
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Проверяем наличие атрибута is_superuser или role
    if not hasattr(current_user, 'is_superuser'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )

    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )

    return current_user


def get_current_user_optional(
        db: Session = Depends(get_db),
        token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[user.model]:
    """
    Опциональный dependency - возвращает пользователя если токен валидный,
    иначе возвращает None
    """
    if token is None:
        return None

    try:
        return get_current_user(db, token)
    except HTTPException:
        return None


# Дополнительные утилиты для работы с JWT
def create_access_token(
        data: dict,
        expires_delta: Optional[int] = None
) -> str:
    """
    Создает JWT access token
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
    except (InvalidTokenError, ValidationError):
        return None