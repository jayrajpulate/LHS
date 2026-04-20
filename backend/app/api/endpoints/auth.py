from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.admin import Admin
from app.schemas.auth import Token, ChangePassword
from app.schemas.admin import AdminCreate, AdminResponse

router = APIRouter()


@router.post("/login", response_model=Token, summary="Admin login")
def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """Authenticate an admin and return a JWT access token."""
    user = db.query(Admin).filter(Admin.AdminuserName == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.Password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.AdminuserName, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.get("/me", response_model=AdminResponse, summary="Get current admin profile")
def read_users_me(current_user: Admin = Depends(deps.get_current_user)):
    """Return the currently authenticated admin's profile."""
    return current_user


@router.post(
    "/register",
    response_model=AdminResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Bootstrap first admin (only works if no admins exist)",
)
def register_first_admin(admin_in: AdminCreate, db: Session = Depends(deps.get_db)):
    """
    One-time bootstrap endpoint. Creates the first admin account.
    Returns 403 Forbidden if any admin already exists.
    """
    if db.query(Admin).count() > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin registration is closed. The system already has administrators.",
        )

    if db.query(Admin).filter(Admin.AdminuserName == admin_in.AdminuserName).first():
        raise HTTPException(status_code=400, detail="Username already taken")

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


@router.post("/change-password", summary="Change current admin password")
def change_password(
    payload: ChangePassword,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_user),
):
    """Change the authenticated admin's password."""
    if not security.verify_password(payload.current_password, current_user.Password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.Password = security.get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Password changed successfully"}
