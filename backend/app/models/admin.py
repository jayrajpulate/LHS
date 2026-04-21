from sqlalchemy import Column, Integer, String, BigInteger, DateTime
from app.db.session import Base
from app.core.timezone import get_ist_now

class Admin(Base):
    __tablename__ = "tbladmin"
    ID = Column(Integer, primary_key=True, index=True)
    AdminName = Column(String(120))
    AdminuserName = Column(String(20), unique=True, index=True)
    MobileNumber = Column(BigInteger)
    Email = Column(String(120), unique=True, index=True)
    Password = Column(String(120))
    AdminRegdate = Column(DateTime, default=get_ist_now)
    UserType = Column(Integer)
