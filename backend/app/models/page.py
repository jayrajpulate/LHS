from sqlalchemy import Column, Integer, String, Text, BigInteger, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class Page(Base):
    __tablename__ = "tblpage"
    ID = Column(Integer, primary_key=True, index=True)
    PageType = Column(String(200), unique=True, index=True)
    PageTitle = Column(String(200))
    PageDescription = Column(Text)
    Email = Column(String(200), nullable=True)
    MobileNumber = Column(BigInteger, nullable=True)
    UpdationDate = Column(DateTime, default=func.now(), onupdate=func.now())
