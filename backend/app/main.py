from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import health
from .routers import articles, tags

app = FastAPI(title="Научная библиотека API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(articles.router)
app.include_router(tags.router)

@app.get("/", summary="API root")
def root():
    return {"name": "Научная библиотека API", "version": "0.1.0"}
