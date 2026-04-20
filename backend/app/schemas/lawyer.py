from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class LawyerBase(BaseModel):
    LawyerName: str
    LawyerEmail: Optional[EmailStr] = None
    LawyerMobileNo: Optional[int] = None
    OfficeAddress: Optional[str] = None
    City: Optional[str] = None
    State: Optional[str] = None
    LanguagesKnown: Optional[str] = None
    LawyerExp: Optional[int] = None
    PracticeAreas: Optional[str] = None
    Courts: Optional[str] = None
    Website: Optional[str] = None
    Description: Optional[str] = None
    IsPublic: int = 0
    AddedBy: Optional[str] = None


class LawyerCreate(LawyerBase):
    pass


class LawyerUpdate(BaseModel):
    LawyerName: Optional[str] = None
    LawyerEmail: Optional[EmailStr] = None
    LawyerMobileNo: Optional[int] = None
    OfficeAddress: Optional[str] = None
    City: Optional[str] = None
    State: Optional[str] = None
    LanguagesKnown: Optional[str] = None
    LawyerExp: Optional[int] = None
    PracticeAreas: Optional[str] = None
    Courts: Optional[str] = None
    Website: Optional[str] = None
    Description: Optional[str] = None
    IsPublic: Optional[int] = None


class LawyerResponse(LawyerBase):
    id: int
    ProfilePic: Optional[str] = None
    RegDate: Optional[datetime] = None

    class Config:
        from_attributes = True


class LawyerListResponse(BaseModel):
    total: int
    page: int
    per_page: int
    lawyers: list[LawyerResponse]
