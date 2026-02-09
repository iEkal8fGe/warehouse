from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    # Базовые настройки
    PROJECT_NAME: str = "FastAPI test"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Безопасность
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # База данных
    # DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/fastapi_db")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///warehouse.db")

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",  # React
        "http://localhost:8080",  # Vue
        "http://localhost:5173",  # Vite
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()