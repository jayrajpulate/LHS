from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class AdminBase(BaseModel):
    AdminName: str
    AdminuserName: str
    MobileNumber: Optional[int] = None
    Email: Optional[EmailStr] = None
    UserType: int = 0


class AdminCreate(AdminBase):
    Password: str


class AdminUpdate(BaseModel):
    AdminName: Optional[str] = None
    MobileNumber: Optional[int] = None
    Email: Optional[EmailStr] = None
    UserType: Optional[int] = None


class AdminResponse(AdminBase):
    ID: int
    AdminRegdate: datetime

    class Config:
        from_attributes = True
