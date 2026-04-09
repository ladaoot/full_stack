import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from .routers import health
from .routers import articles, tags, files, ml, auth
from .database import Base, engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("backend.log")
    ]
)
logger = logging.getLogger("api")

app = FastAPI(title="Научная библиотека API", version="0.1.0")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

@app.on_event("startup")
async def startup():
    # Explicitly import models to ensure they are registered with Base.metadata
    from . import models
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create default user if not exists
    from .database import async_session
    from .models import User
    from .auth import get_password_hash
    from sqlalchemy import select
    # async with async_session() as session:
    #     result = await session.execute(select(User).where(User.id == '00000000-0000-0000-0000-000000000001'))
    #     if not result.scalar_one_or_none():
    #         default_user = User(
    #             id='00000000-0000-0000-0000-000000000001',
    #             email='admin@example.com',
    #             name='Admin',
    #             hashed_password=get_password_hash('admin123'),
    #             affiliation='System'
    #         )
    #         session.add(default_user)
    #         await session.commit()
    
    # Ensure S3 bucket exists on startup
    from .s3 import s3_service
    try:
        await s3_service.ensure_bucket_exists()
    except Exception as e:
        print(f"Warning: S3 bucket setup failed: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(articles.router)
app.include_router(tags.router)
app.include_router(files.router)
app.include_router(ml.router)

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
    errors = exc.errors()
    logger.error(f"Validation error: {errors}")
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({
            "error": {
                "code": 422,
                "message": "Validation error",
                "details": errors,
            }
        }),
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
