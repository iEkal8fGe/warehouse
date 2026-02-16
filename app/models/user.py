from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=True)
    warehouse = relationship("Warehouse", back_populates="users")

    # supplies_created = relationship("Supply", back_populates="created_by")

    def __repr__(self):
        return f"<User {self.username}>"


# python -c "
# from app.database import engine, Base
# from app.models.user import User
# Base.metadata.create_all(bind=engine)
# print('Таблицы созданы')
# "
