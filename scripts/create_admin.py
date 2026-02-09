#!/usr/bin/env python3
import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from app.database import SessionLocal
from app.crud.user import user as crud_user
from app.schemas.user import UserCreate


def create_admin():
    db = SessionLocal()

    try:
        admin = crud_user.get_by_username(db, username="admin")
        if admin:
            print("Already exists!")
            return

        admin_data = UserCreate(
            username="admin",
            password="12345678xX!",
            full_name="Admin admin",
            is_superuser=True
        )
        crud_user.create(db, obj_in=admin_data)

    except Exception as e:
        print(f"Ошибка при создании администратора: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()