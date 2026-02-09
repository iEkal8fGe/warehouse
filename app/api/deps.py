from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
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
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise credentials_exception

    user_obj = user.get_by_username(db, username=token_data.sub)
    if not user_obj:
        raise credentials_exception

    if not user_obj.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    return user_obj


def get_current_active_superuser(
        current_user: user.model = Depends(get_current_user),
) -> user.model:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user
