from pydantic_settings import BaseSettings
from typing import List, Optional
from enum import Enum
from pathlib import Path


class Environment(str, Enum):
    DEVELOPMENT = "development"
    PRODUCTION = "production"


class DatabaseType(str, Enum):
    SQLITE = "sqlite"
    POSTGRESQL = "postgresql"


class Settings(BaseSettings):
    # Базовые настройки
    PROJECT_NAME: str = "FastAPI Shop"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Окружение
    ENVIRONMENT: Environment = Environment.DEVELOPMENT

    # Тип базы данных
    DB_TYPE: DatabaseType = DatabaseType.SQLITE

    # Безопасность
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # SQLite настройки
    SQLITE_DB_PATH: str = "./app.db"

    # PostgreSQL настройки
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    POSTGRES_PORT: str = "5432"

    # CORS
    # BACKEND_CORS_ORIGINS: List[str] = [
    #     "http://localhost:3000",
    #     "http://localhost:8080",
    #     "http://localhost:5173",
    #     "http://localhost:8000",
    # ]

    @property
    def DATABASE_URL(self) -> str:
        if self.DB_TYPE == DatabaseType.POSTGRESQL:
            if not all([self.POSTGRES_SERVER, self.POSTGRES_USER,
                        self.POSTGRES_PASSWORD, self.POSTGRES_DB]):
                raise ValueError("PostgreSQL credentials not set")
            return (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        else:
            # SQLite
            db_path = Path(self.SQLITE_DB_PATH)
            db_path.parent.mkdir(parents=True, exist_ok=True)
            return f"sqlite:///{db_path}"

    class Config:
        env_file = ".env"
        case_sensitive = True
        env_prefix = ""  # Убираем префикс для переменных окружения


settings = Settings()
