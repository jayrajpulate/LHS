from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.models.admin import Admin
from app.schemas.admin import AdminCreate, AdminUpdate, AdminResponse
from app.core import security

router = APIRouter()


@router.get("/", response_model=List[AdminResponse], summary="List all admins")
def list_admins(
    db: Session = Depends(deps.get_db),
    _: Admin = Depends(deps.get_current_user),
):
    """Return a list of all admin users. Requires authentication."""
    return db.query(Admin).all()


@router.post(
    "/",
    response_model=AdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new admin",
)
def create_admin(
    admin_in: AdminCreate,
    db: Session = Depends(deps.get_db),
    _: Admin = Depends(deps.get_current_user),
):
    """Create a new admin user. Only existing admins can do this."""
    if db.query(Admin).filter(Admin.AdminuserName == admin_in.AdminuserName).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(Admin).filter(Admin.Email == admin_in.Email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    db_admin = Admin(
        AdminName=admin_in.AdminName,
        AdminuserName=admin_in.AdminuserName,
        MobileNumber=admin_in.MobileNumber,
        Email=admin_in.Email,
        Password=security.get_password_hash(admin_in.Password),
        UserType=admin_in.UserType,
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin


@router.put("/{admin_id}", response_model=AdminResponse, summary="Update admin details")
def update_admin(
    admin_id: int,
    admin_in: AdminUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_user),
):
    admin = db.query(Admin).filter(Admin.ID == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    for field, value in admin_in.model_dump(exclude_unset=True).items():
        setattr(admin, field, value)
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@router.delete("/{admin_id}", summary="Delete an admin")
def delete_admin(
    admin_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_user),
):
    if current_user.ID == admin_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    admin = db.query(Admin).filter(Admin.ID == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    db.delete(admin)
    db.commit()
    return {"message": "Admin deleted successfully"}
