import sys
import os
import traceback

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.order import OrderStatus
from app.core.security import get_password_hash
from app.schemas.user import UserCreate


def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Database tables created")


def create_initial_admin():
    db = SessionLocal()

    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print("Admin user already exists")
            return

        username = "admin"
        password = "Admin123!"

        UserCreate(username=username, password=password)

        hashed_password = get_password_hash(password)
        admin_user = User(
            username=username,
            hashed_password=hashed_password,
            is_superuser=True,
            is_active=True
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print(f"Admin login: {admin_user.username}")
        print(f"Admin Password: {password}\nDo not forget to change password")
    except Exception as e:
        db.rollback()
        print(f"Error tryna create admin user: {e}")
        traceback.print_exc()
    finally:
        db.close()


def create_order_status():
    db = SessionLocal()

    # statuses = [
    #     {"id": 1, "name": "Новый", "code": "new", "sort_order": 1},
    #     {"id": 2, "name": "Подтвержден", "code": "confirmed", "sort_order": 2},
    #     {"id": 3, "name": "Оплачен", "code": "paid", "sort_order": 3},
    #     {"id": 4, "name": "В обработке", "code": "processing", "sort_order": 4},
    #     {"id": 5, "name": "Отгружен", "code": "shipped", "sort_order": 5},
    #     {"id": 6, "name": "Доставлен", "code": "delivered", "sort_order": 6},
    #     {"id": 7, "name": "Отменен", "code": "cancelled", "sort_order": 7},
    #     {"id": 8, "name": "Возврат", "code": "refunded", "sort_order": 8},
    # ]
    #
    # for status_data in statuses:
    #     status = db.query(OrderStatus).filter(OrderStatus.id == status_data["id"]).first()
    #     if not status:
    #         db.add(OrderStatus(**status_data))

    try:
        status_new = db.query(OrderStatus).filter(OrderStatus.name == "new").first()
        if not status_new:
            status_new = OrderStatus(name="new")
            db.add(status_new)
            db.commit()
            db.refresh(status_new)

        status_shipping = db.query(OrderStatus).filter(OrderStatus.name == "shipping").first()
        if not status_shipping:
            status_shipping = OrderStatus(name="shipping")
            db.add(status_shipping)
            db.commit()
            db.refresh(status_shipping)

    except Exception as e:
        db.rollback()
        print(f"Error tryna create admin user: {e}")
        traceback.print_exc()
    finally:
        db.close()


def main():
    create_tables()
    create_initial_admin()
    create_order_status()


if __name__ == "__main__":
    main()
