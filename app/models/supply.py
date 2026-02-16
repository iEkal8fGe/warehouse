from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Supply(Base):
    __tablename__ = "supplies"

    id = Column(Integer, primary_key=True, index=True)
    supply_number = Column(String, unique=True, nullable=False, index=True)  # SUP-2026-00001
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    warehouse = relationship("Warehouse", back_populates="supplies")
    items = relationship("SupplyItem", back_populates="supply", cascade="all, delete-orphan")


class SupplyItem(Base):
    __tablename__ = "supply_items"

    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey('supplies.id', ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    supply = relationship("Supply", back_populates="items")
    product = relationship("Product", back_populates="supply_items")
