import logging
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.encoders import jsonable_encoder
from prometheus_fastapi_instrumentator import Instrumentator
import psutil
import os
import time
from .routers import health
from .routers import articles, tags, files, ml, auth
from .database import Base, engine
from .prometheus_app_metrics import record_http_request, should_skip_metrics_path

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

# Store startup time
START_TIME = time.time()

# Instrument Prometheus
instrumentator = Instrumentator(
    should_group_status_codes=True,
    should_ignore_untemplated=True,
    should_respect_env_var=True,
    should_instrument_requests_inprogress=True,
    excluded_handlers=[".*admin.*", "/metrics"],
    env_var_name="ENABLE_METRICS",
).instrument(app)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response


@app.middleware("http")
async def app_prometheus_middleware(request: Request, call_next):
    if should_skip_metrics_path(request.url.path):
        return await call_next(request)
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        duration_ms = (time.perf_counter() - start) * 1000
        record_http_request(500, duration_ms)
        raise
    duration_ms = (time.perf_counter() - start) * 1000
    record_http_request(response.status_code, duration_ms)
    return response

@app.on_event("startup")
async def startup():
    # Expose metrics
    instrumentator.expose(app, endpoint="/metrics")
    
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

@app.get("/system/stats", summary="Get system performance metrics")
async def system_stats(request: Request):
    """Returns CPU, Memory and Disk usage metrics or a dashboard if HTML is requested"""
    process = psutil.Process(os.getpid())
    
    # System metrics
    cpu_percent = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    uptime = time.time() - START_TIME
    
    stats = {
        "system": {
            "cpu_percent": cpu_percent,
            "memory": {
                "total": mem.total,
                "available": mem.available,
                "percent": mem.percent,
            },
            "disk": {
                "total": disk.total,
                "free": disk.free,
                "percent": disk.percent,
            },
            "uptime_seconds": int(uptime)
        },
        "process": {
            "cpu_percent": process.cpu_percent(),
            "memory_rss": process.memory_info().rss,
            "threads": process.num_threads(),
        },
        "status": "online"
    }

    # If HTML is requested, return a simple dashboard
    if "text/html" in request.headers.get("Accept", ""):
        html_content = f"""
        <html>
            <head>
                <title>System Monitor</title>
                <meta http-equiv="refresh" content="5">
                <style>
                    body {{ font-family: sans-serif; background: #f4f4f9; padding: 20px; color: #333; }}
                    .card {{ background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                    .bar-container {{ background: #eee; border-radius: 4px; height: 20px; width: 100%; margin: 10px 0; }}
                    .bar {{ background: #3b82f6; height: 100%; border-radius: 4px; transition: width 0.5s; }}
                    .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }}
                    h1 {{ color: #1e293b; }}
                    h2 {{ margin-top: 0; color: #64748b; font-size: 1.2rem; }}
                    .val {{ font-weight: bold; float: right; }}
                </style>
            </head>
            <body>
                <h1>🚀 System Monitoring</h1>
                <div class="grid">
                    <div class="card">
                        <h2>CPU Usage</h2>
                        <div class="bar-container"><div class="bar" style="width: {cpu_percent}%"></div></div>
                        <p>Total Load <span class="val">{cpu_percent}%</span></p>
                    </div>
                    <div class="card">
                        <h2>Memory</h2>
                        <div class="bar-container"><div class="bar" style="width: {mem.percent}%"></div></div>
                        <p>Used: {mem.percent}% <span class="val">{mem.available // (1024*1024)}MB free</span></p>
                    </div>
                    <div class="card">
                        <h2>Disk Storage</h2>
                        <div class="bar-container"><div class="bar" style="width: {disk.percent}%"></div></div>
                        <p>Used: {disk.percent}% <span class="val">{disk.free // (1024*1024*1024)}GB free</span></p>
                    </div>
                    <div class="card">
                        <h2>Process Info</h2>
                        <p>Uptime <span class="val">{int(uptime // 3600)}h {int((uptime % 3600) // 60)}m {int(uptime % 60)}s</span></p>
                        <p>Threads <span class="val">{stats['process']['threads']}</span></p>
                        <p>Memory RSS <span class="val">{stats['process']['memory_rss'] // (1024*1024)} MB</span></p>
                    </div>
                </div>
                <p style="text-align: center; color: #94a3b8; font-size: 0.8rem;">Auto-refreshing every 5 seconds</p>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content)
        
    return stats

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
