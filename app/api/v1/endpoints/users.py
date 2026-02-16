from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.user import UserResponse, UserCreate, UserUpdate, UserList, UserInDB
from app.crud.user import user


router = APIRouter()


# - - - ADMIN ROUTES - - - #


@router.get("/{user_id}", response_model=UserResponse)
def read_user_by_id(
        user_id: int,
        db: Session = Depends(deps.get_db)
) -> Any:
    current_user = user.get_by_id(db, id=user_id)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return current_user


@router.patch("/status", response_model=UserResponse)
def update_user_active(
        *,
        db: Session = Depends(deps.get_db),
        user_id: int,
        user_data: UserUpdate,
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    """ Change the active status of user by id [RAW JSON]"""
    db_user = user.get(db, id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can not deactivate yourself",
        )

    if user_data.is_active == db_user.is_active:
        return db_user

    db_user.is_active = user_data.is_active
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
        *,
        db: Session = Depends(deps.get_db),
        user_id,
        user_data: UserUpdate,
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    """ Update a user information using id [RAW JSON] """
    db_user = user.get_by_id(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user_data.username and user_data.username != db_user.username:
        if user.get_by_username(db, username=user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered. Create unique username or do not change it",
            )

    updated_user = user.update(db, db_obj=db_user, obj_in=user_data)
    return updated_user


@router.delete("/{user_id}")
def delete_user(
        *,
        db: Session = Depends(deps.get_db),
        user_id,
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    """ Remove a user from the database by id [None] """
    if not user.get_by_id(db, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can not remove yourself",
        )

    user.remove(db, row_id=user_id)


@router.post("/", response_model=UserResponse)
def create_user(
        *,
        db: Session = Depends(deps.get_db),
        user_data: UserCreate,
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    """ Create a new user [RAW JSON] """
    if user.get_by_username(db, username=user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    new_user = user.create(db, obj_in=user_data)
    return new_user


# - - - /END ADMIN ROUTES - - - #
