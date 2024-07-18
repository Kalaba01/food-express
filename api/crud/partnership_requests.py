from sqlalchemy.orm import Session
from models.models import PartnershipRequest
from schemas.schemas import PartnershipRequestCreate

def create_partnership_request(db: Session, partnership_request: PartnershipRequestCreate):
    db_partnership_request = PartnershipRequest(**partnership_request.dict())
    db.add(db_partnership_request)
    db.commit()
    db.refresh(db_partnership_request)
    return db_partnership_request

def get_partnership_requests(db: Session, skip: int = 0, limit: int = 100):
    return db.query(PartnershipRequest).offset(skip).limit(limit).all()

def get_partnership_request(db: Session, partnership_request_id: int):
    return db.query(PartnershipRequest).filter(PartnershipRequest.id == partnership_request_id).first()

def delete_partnership_request(db: Session, partnership_request_id: int):
    db_partnership_request = db.query(PartnershipRequest).filter(PartnershipRequest.id == partnership_request_id).first()
    if db_partnership_request:
        db.delete(db_partnership_request)
        db.commit()
    return db_partnership_request
