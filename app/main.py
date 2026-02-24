from fastapi import FastAPI # , Request, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.api import api_router
# from app.database import get_db
# from app.api.deps import get_current_user

import uvicorn


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Но помните: allow_origins=["*"] не работает с allow_credentials=True. Для продакшна нужно явно указывать домены
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Если используете порт 3000
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173",
        "http://localhost:5174",  # На всякий случай
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )


# On win
# .venv\Scripts\Activate.ps1

# Other
# source venv\bin\Activate

# python -m app.main
