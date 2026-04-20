from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.models.practice_area import PracticeArea
from app.models.admin import Admin
from app.schemas.practice_area import PracticeAreaCreate, PracticeAreaUpdate, PracticeAreaResponse

router = APIRouter()


@router.get("/", response_model=List[PracticeAreaResponse], summary="List all practice areas")
def list_practice_areas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
):
    return db.query(PracticeArea).order_by(PracticeArea.PracticeArea).offset(skip).limit(limit).all()


@router.post(
    "/",
    response_model=PracticeAreaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Create a practice area",
)
def create_practice_area(
    area_in: PracticeAreaCreate,
    db: Session = Depends(deps.get_db),
    current_admin: Admin = Depends(deps.get_current_user),
):
    existing = db.query(PracticeArea).filter(
        PracticeArea.PracticeArea.ilike(area_in.PracticeArea)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Practice area already exists")

    db_obj = PracticeArea(
        PracticeArea=area_in.PracticeArea,
        AddedBy=current_admin.AdminuserName,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.put("/{area_id}", response_model=PracticeAreaResponse, summary="[Admin] Update a practice area")
def update_practice_area(
    area_id: int,
    area_in: PracticeAreaUpdate,
    db: Session = Depends(deps.get_db),
    _: Admin = Depends(deps.get_current_user),
):
    area = db.query(PracticeArea).filter(PracticeArea.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Practice area not found")
    area.PracticeArea = area_in.PracticeArea
    db.add(area)
    db.commit()
    db.refresh(area)
    return area


@router.delete("/{area_id}", summary="[Admin] Delete a practice area")
def delete_practice_area(
    area_id: int,
    db: Session = Depends(deps.get_db),
    _: Admin = Depends(deps.get_current_user),
):
    area = db.query(PracticeArea).filter(PracticeArea.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Practice area not found")
    db.delete(area)
    db.commit()
    return {"message": "Practice area deleted successfully"}
