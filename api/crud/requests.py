from sqlalchemy.orm import Session
from models.models import Request
from schemas.schemas import RequestCreate

async def create_request(db: Session, request: RequestCreate):
    db_request = Request(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

async def get_requests(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Request).offset(skip).limit(limit).all()

async def get_request(db: Session, request_id: int):
    return db.query(Request).filter(Request.id == request_id).first()

async def delete_request(db: Session, request_id: int):
    db_request = db.query(Request).filter(Request.id == request_id).first()
    if db_request:
        db.delete(db_request)
        db.commit()
    return db_request
