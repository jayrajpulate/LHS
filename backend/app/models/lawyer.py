from sqlalchemy import Column, Integer, String, BigInteger, Text, DateTime
from app.db.session import Base
from app.core.timezone import get_ist_now

class Lawyer(Base):
    __tablename__ = "tbllawyers"
    id = Column(Integer, primary_key=True, index=True)
    LawyerName = Column(String(200))
    LawyerEmail = Column(String(200))
    LawyerMobileNo = Column(BigInteger)
    OfficeAddress = Column(Text)
    City = Column(String(255))
    State = Column(String(255))
    LanguagesKnown = Column(Text)
    ProfilePic = Column(String(200))
    LawyerExp = Column(BigInteger)
    PracticeAreas = Column(Text)
    Courts = Column(Text)
    Website = Column(String(150))
    Description = Column(Text)
    RegDate = Column(DateTime, default=get_ist_now)
    IsPublic = Column(Integer, default=0)
    AddedBy = Column(String(120))
