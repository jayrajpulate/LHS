import sys
import os

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.lawyer import Lawyer

def check_db():
    db = SessionLocal()
    try:
        count = db.query(Lawyer).count()
        print(f"Total lawyers in DB: {count}")
        
        lawyers = db.query(Lawyer).order_by(Lawyer.RegDate.desc()).limit(5).all()
        for idx, l in enumerate(lawyers):
            print(f"Lawyer {idx+1}: {l.id} - {l.LawyerName} - IsPublic: {l.IsPublic} - RegDate: {l.RegDate}")
    except Exception as e:
        print(f"Error querying DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
