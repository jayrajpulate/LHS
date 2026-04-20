from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class PracticeArea(Base):
    __tablename__ = "tblpracticearea"
    id = Column(Integer, primary_key=True, index=True)
    PracticeArea = Column(String(200))
    AddedBy = Column(String(20))
    CreationDate = Column(DateTime, default=func.now())
