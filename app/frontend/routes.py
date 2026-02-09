from fastapi import APIRouter, Request, Depends, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.crud.user import user as crud_user
from app.core.security import create_access_token
from app.schemas.user import UserCreate

router = APIRouter()
templates = Jinja2Templates(directory="app/frontend/templates")


@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


@router.get("/products", response_class=HTMLResponse)
async def products_page(
        request: Request,
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
):
    # Здесь можно получить товары пользователя
    return templates.TemplateResponse(
        "products.html",
        {
            "request": request,
            "current_user": current_user,
            "products": []  # Добавьте получение товаров
        }
    )


@router.post("/api/login")
async def login_form(
        request: Request,
        username: str = Form(...),
        password: str = Form(...),
        db: Session = Depends(get_db)
):
    user_obj = crud_user.authenticate(db, username=username, password=password)
    if not user_obj:
        return templates.TemplateResponse(
            "login.html",
            {"request": request, "error": "Неверный логин или пароль"}
        )

    # Создаем токен и устанавливаем куку
    token = create_access_token(data={"sub": user_obj.username})
    response = RedirectResponse("/products", status_code=302)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=1800  # 30 минут
    )
    return response


@router.post("/api/register")
async def register_form(
        request: Request,
        username: str = Form(...),
        email: str = Form(...),
        password: str = Form(...),
        full_name: str = Form(None),
        db: Session = Depends(get_db)
):
    try:
        user_in = UserCreate(
            username=username,
            email=email,
            password=password,
            full_name=full_name
        )
        new_user = crud_user.create(db, obj_in=user_in)

        # Автоматический логин после регистрации
        token = create_access_token(data={"sub": new_user.username})
        response = RedirectResponse("/products", status_code=302)
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            max_age=1800
        )
        return response
    except Exception as e:
        return templates.TemplateResponse(
            "register.html",
            {"request": request, "error": str(e)}
        )
