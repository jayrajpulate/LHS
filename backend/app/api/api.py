from fastapi import APIRouter
from app.api.endpoints import auth, lawyers, practice_areas, pages, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(lawyers.router, prefix="/lawyers", tags=["Lawyers"])
api_router.include_router(practice_areas.router, prefix="/practice-areas", tags=["Practice Areas"])
api_router.include_router(pages.router, prefix="/pages", tags=["Site Pages"])
api_router.include_router(admin.router, prefix="/admins", tags=["Admin Management"])
