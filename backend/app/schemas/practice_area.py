from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PracticeAreaBase(BaseModel):
    PracticeArea: str


class PracticeAreaCreate(PracticeAreaBase):
    pass


class PracticeAreaUpdate(BaseModel):
    PracticeArea: str


class PracticeAreaResponse(PracticeAreaBase):
    id: int
    AddedBy: Optional[str] = None
    CreationDate: datetime

    class Config:
        from_attributes = True
