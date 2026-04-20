from sqlalchemy import Column, Integer, String, BigInteger, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class Admin(Base):
    __tablename__ = "tbladmin"
    ID = Column(Integer, primary_key=True, index=True)
    AdminName = Column(String(120))
    AdminuserName = Column(String(20), unique=True, index=True)
    MobileNumber = Column(BigInteger)
    Email = Column(String(120), unique=True, index=True)
    Password = Column(String(120))
    AdminRegdate = Column(DateTime, default=func.now())
    UserType = Column(Integer)
