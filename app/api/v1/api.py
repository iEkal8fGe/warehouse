""" Merge all API-v1 endpoints """

from fastapi import APIRouter
from app.api.v1.endpoints import auth, products, users, warehouses, supplies, orders, inventory
from app.api.v1.endpoints.external import orders as external_orders


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(warehouses.router, prefix="/warehouses", tags=["warehouses"])
api_router.include_router(supplies.router, prefix="/supplies", tags=["supplies"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(external_orders.router, prefix="/external", tags=["external"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
