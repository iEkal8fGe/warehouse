#!/usr/bin/env python3
"""
Скрипт инициализации базы данных.
Создает все таблицы и начальные данные.
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.product import Product
from app.crud.user import user as crud_user
from app.schemas.user import UserCreate
from app.core.security import get_password_hash


def create_tables():
    """Создание всех таблиц в базе данных"""
    print("Создание таблиц...")
    Base.metadata.create_all(bind=engine)
    print("✓ Таблицы созданы успешно")


def create_initial_admin():
    """Создание начального администратора"""
    db = SessionLocal()
    try:
        # Проверяем, существует ли уже админ
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print("✓ Администратор уже существует")
            return

        # Создаем хеш пароля вручную, чтобы обойти ограничение длины
        password = "Admin123!"  # Более надежный пароль
        if len(password) > 72:
            password = password[:72]  # Обрезаем до 72 символов для bcrypt

        admin_data = {
            "username": "admin",
            "email": "admin@example.com",
            "password": password,
            "full_name": "Системный Администратор",
            "is_superuser": True
        }

        # Создаем пользователя напрямую, чтобы избежать проблем с валидацией
        hashed_password = get_password_hash(password)
        admin_user = User(
            username=admin_data["username"],
            email=admin_data["email"],
            full_name=admin_data["full_name"],
            hashed_password=hashed_password,
            is_superuser=True
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("✓ Администратор создан успешно!")
        print(f"   Имя пользователя: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   Пароль: {password}")
        print("\n⚠️  ВАЖНО: Измените пароль после первого входа!")

    except Exception as e:
        db.rollback()
        print(f"✗ Ошибка при создании администратора: {e}")
        raise
    finally:
        db.close()


def create_test_data():
    """Создание тестовых данных"""
    db = SessionLocal()
    try:
        # Создаем тестового пользователя
        existing_user = db.query(User).filter(User.username == "testuser").first()
        if not existing_user:
            password = "Test123!"[:72]  # Обрезаем для bcrypt
            hashed_password = get_password_hash(password)
            test_user = User(
                username="testuser",
                email="test@example.com",
                full_name="Тестовый Пользователь",
                hashed_password=hashed_password,
                is_superuser=False
            )
            db.add(test_user)
            db.commit()
            print("✓ Тестовый пользователь создан")

        # Создаем тестовые товары
        from app.models.product import Product
        products_count = db.query(Product).count()
        if products_count == 0:
            test_products = [
                Product(name="Ноутбук", description="Мощный игровой ноутбук", price=999.99),
                Product(name="Смартфон", description="Флагманский смартфон", price=699.99),
                Product(name="Наушники", description="Беспроводные наушники", price=199.99),
                Product(name="Клавиатура", description="Механическая клавиатура", price=129.99),
                Product(name="Монитор", description="4K монитор 27 дюймов", price=499.99),
            ]
            db.add_all(test_products)
            db.commit()
            print("✓ Тестовые товары созданы")

    except Exception as e:
        db.rollback()
        print(f"✗ Ошибка при создании тестовых данных: {e}")
    finally:
        db.close()


def main():
    """Основная функция"""
    print("=" * 50)
    print("Инициализация базы данных")
    print("=" * 50)

    create_tables()
    create_initial_admin()
    create_test_data()

    print("\n" + "=" * 50)
    print("Инициализация завершена успешно!")
    print("=" * 50)


if __name__ == "__main__":
    main()
