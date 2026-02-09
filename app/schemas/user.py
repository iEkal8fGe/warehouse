from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    password: str

    @field_validator('password')
    def password_strength(self, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None


class UserInDB(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class UserResponse(UserInDB):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None