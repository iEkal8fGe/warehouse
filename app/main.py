from fastapi import FastAPI
from fastapi.responses import HTMLResponse


app = FastAPI(title="Мой первый FastAPI", version="1.0.0")


@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>FastAPI на Python 3.14</title>
            <style>
                body { font-family: Arial; padding: 40px; }
                h1 { color: #009688; }
                code { background: #f4f4f4; padding: 2px 5px; }
            </style>
        </head>
        <body>
            <h1>🎉 FastAPI работает!</h1>
            <p>Python 3.14 + FastAPI + uv</p>
            <ul>
                <li><a href="/docs">📚 Swagger документация</a></li>
                <li><a href="/redoc">📖 ReDoc документация</a></li>
                <li><a href="/api/health">❤️ Health check</a></li>
                <li><a href="/api/items/123">📦 Пример API</a></li>
            </ul>
        </body>
    </html>
    """

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "python_version": "3.14",
        "stack": "FastAPI + uv"
    }

@app.get("/api/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    return {
        "item_id": item_id,
        "query": q,
        "message": f"Обработка item {item_id}"
    }

@app.post("/api/items/")
async def create_item(name: str, price: float):
    return {
        "name": name,
        "price": price,
        "created": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


# python -m app.main
