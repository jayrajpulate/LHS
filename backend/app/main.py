from contextlib import asynccontextmanager
import os
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.api.api import api_router
from app.core.config import settings

from app.core.logger import logger



@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: runs startup and shutdown logic."""
    # --- Startup ---
    logger.info("Starting up LHS API...")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info(f"Upload directory ready: {settings.UPLOAD_DIR}")
    yield
    # --- Shutdown ---
    logger.info("Shutting down LHS API...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-ready REST API for the Lawyer Hiring System",
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None,
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files ──────────────────────────────────────────────────────────────
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── Global Exception Handlers ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api")


@app.get("/", tags=["health"])
def root():
    return {
        "message": f"{settings.APP_NAME} API is running.",
        "version": settings.APP_VERSION,
        "env": settings.APP_ENV,
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
