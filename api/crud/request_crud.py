from sqlalchemy.orm import Session
from models.models import Request
from schemas.schemas import RequestCreate, RequestStatusUpdate
from datetime import datetime

async def get_all_requests(db: Session):
    return db.query(Request).all()

async def check_pending_request_by_email(db: Session, email: str):
    return db.query(Request).filter(Request.email == email, Request.status == "pending").first()

async def create_request(db: Session, request: RequestCreate):
    new_request = Request(
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        additional_info=request.additional_info if request.additional_info else None,
        request_type=request.request_type,
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

async def update_request_status(db: Session, request_id: int, status_update: RequestStatusUpdate):
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        return None
    request.status = status_update.status
    db.commit()
    db.refresh(request)
    return request
