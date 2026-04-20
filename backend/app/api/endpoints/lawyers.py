from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pathlib import Path
import shutil
import uuid
import os

from app.api import deps
from app.models.lawyer import Lawyer
from app.models.admin import Admin
from app.schemas.lawyer import LawyerResponse, LawyerListResponse, LawyerUpdate
from app.core.config import settings

router = APIRouter()

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _save_upload(file: UploadFile) -> str:
    """Save an uploaded file and return the generated filename."""
    ext = Path(file.filename).suffix.lower()
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not allowed. Use: {allowed}")

    max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    contents = file.file.read()
    if len(contents) > max_size:
        raise HTTPException(status_code=413, detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE_MB}MB")
    file.file.seek(0)

    filename = f"{uuid.uuid4()}{ext}"
    with open(UPLOAD_DIR / filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return filename


# ─── Public Endpoints ─────────────────────────────────────────────────────────

@router.get("/", response_model=LawyerListResponse, summary="List public lawyers with search/filter")
def list_lawyers(
    name: Optional[str] = Query(None, description="Filter by lawyer name"),
    city: Optional[str] = Query(None, description="Filter by city"),
    state: Optional[str] = Query(None, description="Filter by state"),
    practice_area: Optional[str] = Query(None, description="Filter by practice area"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(12, ge=1, le=50, description="Results per page"),
    db: Session = Depends(deps.get_db),
):
    """Return paginated public lawyers with optional search/filter."""
    query = db.query(Lawyer).filter(Lawyer.IsPublic == 1)

    if name:
        query = query.filter(Lawyer.LawyerName.ilike(f"%{name}%"))
    if city:
        query = query.filter(Lawyer.City.ilike(f"%{city}%"))
    if state:
        query = query.filter(Lawyer.State.ilike(f"%{state}%"))
    if practice_area:
        query = query.filter(Lawyer.PracticeAreas.ilike(f"%{practice_area}%"))

    total = query.count()
    lawyers = query.offset((page - 1) * per_page).limit(per_page).all()

    return LawyerListResponse(total=total, page=page, per_page=per_page, lawyers=lawyers)


@router.get("/{lawyer_id}", response_model=LawyerResponse, summary="Get public lawyer by ID")
def get_lawyer(lawyer_id: int, db: Session = Depends(deps.get_db)):
    """Get a single public lawyer's profile."""
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id, Lawyer.IsPublic == 1).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    return lawyer


# ─── Admin Endpoints ──────────────────────────────────────────────────────────

@router.get(
    "/admin/all",
    response_model=LawyerListResponse,
    summary="[Admin] List ALL lawyers including private",
)
def admin_list_lawyers(
    name: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    is_public: Optional[int] = Query(None, description="Filter by public status: 0 or 1"),
    page: int = Query(1, ge=1),
    per_page: int = Query(15, ge=1, le=100),
    db: Session = Depends(deps.get_db),
    _: Admin = Depends(deps.get_current_user),
):
    query = db.query(Lawyer)
    if name:
        query = query.filter(Lawyer.LawyerName.ilike(f"%{name}%"))
    if city:
        query = query.filter(Lawyer.City.ilike(f"%{city}%"))
    if is_public is not None:
        query = query.filter(Lawyer.IsPublic == is_public)

    total = query.count()
    lawyers = query.order_by(Lawyer.RegDate.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return LawyerListResponse(total=total, page=page, per_page=per_page, lawyers=lawyers)


@router.post(
    "/admin",
    response_model=LawyerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Add a new lawyer",
)
def create_lawyer(
    LawyerName: str = Form(...),
    LawyerEmail: Optional[str] = Form(None),
    LawyerMobileNo: Optional[int] = Form(None),
    OfficeAddress: Optional[str] = Form(None),
    City: Optional[str] = Form(None),
    State: Optional[str] = Form(None),
    LanguagesKnown: Optional[str] = Form(None),
    LawyerExp: Optional[int] = Form(None),
    PracticeAreas: Optional[str] = Form(None),
    Courts: Optional[str] = Form(None),
    Website: Optional[str] = Form(None),
    Description: Optional[str] = Form(None),
    IsPublic: int = Form(0),
    profile_pic: Optional[UploadFile] = File(None),
    db: Session = Depends(deps.get_db),
    current_admin: Admin = Depends(deps.get_current_user),
):
    """Create a new lawyer profile. Requires admin authentication."""
    file_name = None
    if profile_pic and profile_pic.filename:
        file_name = _save_upload(profile_pic)

    db_lawyer = Lawyer(
        LawyerName=LawyerName,
        LawyerEmail=LawyerEmail,
        LawyerMobileNo=LawyerMobileNo,
        OfficeAddress=OfficeAddress,
        City=City,
        State=State,
        LanguagesKnown=LanguagesKnown,
        LawyerExp=LawyerExp,
        PracticeAreas=PracticeAreas,
        Courts=Courts,
        Website=Website,
        Description=Description,
        IsPublic=IsPublic,
        ProfilePic=file_name,
        AddedBy=current_admin.AdminuserName,
    )
    db.add(db_lawyer)
    db.commit()
    db.refresh(db_lawyer)
    return db_lawyer


@router.put("/admin/{lawyer_id}", response_model=LawyerResponse, summary="[Admin] Update lawyer")
def update_lawyer(
    lawyer_id: int,
    LawyerName: Optional[str] = Form(None),
    LawyerEmail: Optional[str] = Form(None),
    LawyerMobileNo: Optional[int] = Form(None),
    OfficeAddress: Optional[str] = Form(None),
    City: Optional[str] = Form(None),
    State: Optional[str] = Form(None),
    LanguagesKnown: Optional[str] = Form(None),
    LawyerExp: Optional[int] = Form(None),
    PracticeAreas: Optional[str] = Form(None),
    Courts: Optional[str] = Form(None),
    Website: Optional[str] = Form(None),
    Description: Optional[str] = Form(None),
    IsPublic: Optional[int] = Form(None),
    profile_pic: Optional[UploadFile] = File(None),
    db: Session = Depends(deps.get_db),
    _: Admin = Depends(deps.get_current_user),
):
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")

    update_data = {
        "LawyerName": LawyerName,
        "LawyerEmail": LawyerEmail,
        "LawyerMobileNo": LawyerMobileNo,
        "OfficeAddress": OfficeAddress,
        "City": City,
        "State": State,
        "LanguagesKnown": LanguagesKnown,
        "LawyerExp": LawyerExp,
        "PracticeAreas": PracticeAreas,
        "Courts": Courts,
        "Website": Website,
        "Description": Description,
        "IsPublic": IsPublic,
    }
    for field, value in update_data.items():
        if value is not None:
            setattr(lawyer, field, value)

    if profile_pic and profile_pic.filename:
        # Remove old picture
        if lawyer.ProfilePic:
            old_path = UPLOAD_DIR / lawyer.ProfilePic
            if old_path.exists():
                os.remove(old_path)
        lawyer.ProfilePic = _save_upload(profile_pic)

    db.add(lawyer)
    db.commit()
    db.refresh(lawyer)
    return lawyer


@router.patch(
    "/admin/{lawyer_id}/toggle-public",
    response_model=LawyerResponse,
    summary="[Admin] Toggle lawyer public visibility",
)
def toggle_lawyer_visibility(
    lawyer_id: int,
    db: Session = Depends(deps.get_db),
    _: Admin = Depends(deps.get_current_user),
):
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    lawyer.IsPublic = 1 if lawyer.IsPublic == 0 else 0
    db.add(lawyer)
    db.commit()
    db.refresh(lawyer)
    return lawyer


@router.delete("/admin/{lawyer_id}", summary="[Admin] Delete a lawyer")
def delete_lawyer(
    lawyer_id: int,
    db: Session = Depends(deps.get_db),
    _: Admin = Depends(deps.get_current_user),
):
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")

    if lawyer.ProfilePic:
        pic_path = UPLOAD_DIR / lawyer.ProfilePic
        if pic_path.exists():
            os.remove(pic_path)

    db.delete(lawyer)
    db.commit()
    return {"message": "Lawyer deleted successfully"}
