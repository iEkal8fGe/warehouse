from pydantic import BaseModel, field_validator, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


# - - - USER PYDANTIC MODELS - - - #


class UserBase(BaseModel):
    username: str
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False


class UserInDB(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class UserCreate(UserBase):
    # username: str
    password: str
    # is_superuser: Optional[bool] = False

    @field_validator('password')
    @classmethod
    def password_strength(cls, v) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v


class UserUpdate(BaseModel):
    # id: int
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None


class UserPatch(BaseModel):
    is_active: bool


class UserResponse(UserInDB):
    model_config = ConfigDict(from_attributes=True)
    hashed_password: Optional[str] = Field(None, exclude=True)


class UserList(BaseModel):
    total: int
    users: List[UserResponse]


# - - - /END USER PYDANTIC MODELS - - - #


# - - - JWT TOKEN PYDANTIC MODELS - - - #


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = 3600    # seconds


class TokenPayload(BaseModel):
    sub: Optional[str] = Field(None, description="Subject (username)")
    user_id: Optional[int] = Field(None, description="User ID")
    exp: Optional[int] = Field(None, description="Expiration timestamp")
    iat: Optional[int] = Field(None, description="Issued at timestamp")
    is_superuser: Optional[bool] = Field(False, description="Is superuser")

    @property
    def is_expired(self) -> bool:
        if self.exp is None:
            return False
        return datetime.fromtimestamp(self.exp) < datetime.now()

# - - - /END JWT TOKEN PYDANTIC MODELS - - - #
