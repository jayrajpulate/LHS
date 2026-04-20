from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.models.page import Page
from app.models.admin import Admin
from app.schemas.page import PageCreate, PageUpdate, PageResponse

router = APIRouter()


@router.get("/", response_model=List[PageResponse], summary="List all pages")
def list_pages(db: Session = Depends(deps.get_db)):
    return db.query(Page).all()


@router.get("/{pagetype}", response_model=PageResponse, summary="Get page by type")
def get_page(pagetype: str, db: Session = Depends(deps.get_db)):
    page = db.query(Page).filter(Page.PageType == pagetype).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.put(
    "/{pagetype}",
    response_model=PageResponse,
    summary="[Admin] Create or update a page",
)
def upsert_page(
    pagetype: str,
    page_in: PageUpdate,
    db: Session = Depends(deps.get_db),
    _: Admin = Depends(deps.get_current_user),
):
    """Create the page if it doesn't exist, otherwise update it."""
    page = db.query(Page).filter(Page.PageType == pagetype).first()
    if not page:
        page = Page(PageType=pagetype)
        db.add(page)

    for field, value in page_in.model_dump(exclude_unset=True).items():
        setattr(page, field, value)

    db.add(page)
    db.commit()
    db.refresh(page)
    return page
