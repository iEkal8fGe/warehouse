from fastapi import FastAPI # , Request, Depends
# from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.api import api_router
# from app.database import get_db
# from app.api.deps import get_current_user


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)


# Настройка CORS
# if settings.BACKEND_CORS_ORIGINS:
#     app.add_middleware(
#         CORSMiddleware,
#         allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
#         allow_credentials=True,
#         allow_methods=["*"],
#         allow_headers=["*"],
#     )


app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
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
