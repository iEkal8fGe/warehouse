from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
# from sqlalchemy.sql.functions import current_user

from app.api import deps
from app.schemas.user import UserResponse, UserCreate, UserUpdate, UserList, UserInDB, UserDelete
from app.crud.user import user


router = APIRouter()


# @router.get("/users", response_model=UserList)
# def read_users(
#         db: Session = Depends(deps.get_db),
#         skip: int = Query(0, ge=0),
#         limit: int = Query(100, ge=1, le=100),
#         current_user: UserInDB = Depends(deps.get_current_active_superuser),
# ) -> Any:
#     """
#     Получить список пользователей (только для админов)
#     """
#     # get_multi does not exists!
#     users = crud.user.get_multi(db, skip=skip, limit=limit)
#     total = db.query(crud.user.model).count()
#
#     return {
#         "total": total,
#         "users": users
#     }


# @router.get('/users/{user_id}/change_role', response_model=UserResponse)
# async def change_user_role(
#         user_id: int,
#         db: Session = Depends(deps.get_db)
# ) -> Any:
#     cuser = user.get_by_id(db, id=user_id)
#     if not current_user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="User not found",
#         )
#
#     if


@router.get("/users/{user_id}", response_model=UserResponse)
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


@router.put("/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
        *,
        db: Session = Depends(deps.get_db),
        user_id: int,
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    cuser = user.get(db, id=user_id)
    if not cuser:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if cuser.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can not deactivate yourself",
        )

    cuser.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user


@router.post("/update_user", response_model=UserResponse)
def update_user(
        *,
        db: Session = Depends(deps.get_db),
        user_data: UserUpdate,
) -> Any:
    current_user = user.get_by_id(db, user_id=user_data.id)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    current_user = user.update(db, db_obj=user, obj_in=user_data)
    return current_user


@router.delete("/delete_user", response_model=UserResponse)
def delete_user(
        *,
        db: Session = Depends(deps.get_db),
        user_data: UserDelete,
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    cuser = user.get_by_id(db, user_id=user_data.id)
    if not cuser:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if cuser.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can not remove yourself",
        )

    cuser = user.remove(db, row_id=user_data.id)
    return cuser


@router.post("/create_user", response_model=UserResponse)
def create_user(
        *,
        db: Session = Depends(deps.get_db),
        user_data: UserCreate,
        current_user: UserInDB = Depends(deps.get_current_active_superuser),
) -> Any:
    if user.get_by_username(db, username=user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    new_user = user.create(db, obj_in=user_data)
    return new_user
