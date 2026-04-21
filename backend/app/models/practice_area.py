from sqlalchemy import Column, Integer, String, DateTime
from app.db.session import Base
from app.core.timezone import get_ist_now

class PracticeArea(Base):
    __tablename__ = "tblpracticearea"
    id = Column(Integer, primary_key=True, index=True)
    PracticeArea = Column(String(200))
    AddedBy = Column(String(20))
    CreationDate = Column(DateTime, default=get_ist_now)
