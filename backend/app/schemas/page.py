from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class PageBase(BaseModel):
    PageTitle: str
    PageDescription: str
    Email: Optional[EmailStr] = None
    MobileNumber: Optional[int] = None

class PageCreate(PageBase):
    PageType: str

class PageUpdate(PageBase):
    pass

class PageResponse(PageBase):
    ID: int
    PageType: str
    UpdationDate: Optional[datetime] = None

    class Config:
        from_attributes = True
