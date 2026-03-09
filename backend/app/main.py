from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
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

@app.exception_handler(HTTPException)
def http_exception_handler(_, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.status_code, "message": str(exc.detail)}},
    )

@app.exception_handler(RequestValidationError)
def validation_exception_handler(_, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": 422,
                "message": "Validation error",
                "details": exc.errors(),
            }
        },
    )

@app.exception_handler(404)
def not_found_handler(_, __):
    return JSONResponse(
        status_code=404,
        content={
            "error": {
                "code": 404,
                "message": "The requested resource was not found on this server."
            }
        },
    )
