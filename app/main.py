from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from app.api.api import api_router
from app.config import settings
from app.frontend.routes import router as frontend_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Настройка CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Монтируем API
app.include_router(api_router, prefix=settings.API_V1_STR)

# Монтируем фронтенд
app.include_router(frontend_router)

# Статические файлы
app.mount("/static", StaticFiles(directory="app/frontend/static"), name="static")

# Шаблоны Jinja2
templates = Jinja2Templates(directory="app/frontend/templates")


@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )


# On win
# .venv\Scripts\Activate.ps1

# Other
# source venv\bin\Activate

# python -m app.main
