import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.page import Page

def seed():
    db = SessionLocal()
    pages = [
        {
            "PageType": "aboutus",
            "PageTitle": "About LHS",
            "PageDescription": "LHS (Lawyer Hiring System) is India's most trusted legal hiring platform, dedicated to bridging the gap between citizens and verified legal professionals. We meticulously verify every advocate on our platform to ensure you get the best legal representation across every court and city in India."
        },
        {
            "PageType": "contactus",
            "PageTitle": "Contact Us",
            "PageDescription": "We are here to help you. If you have any questions or need assistance finding the right legal expert, please reach out to our support team."
        }
    ]

    for p in pages:
        existing = db.query(Page).filter(Page.PageType == p["PageType"]).first()
        if not existing:
            page = Page(**p)
            db.add(page)
            print(f"Adding page: {p['PageType']}")
        else:
            print(f"Page already exists: {p['PageType']}")

    db.commit()
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed()
