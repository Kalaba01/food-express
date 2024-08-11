from sqlalchemy.orm import Session
from models.models import Request
from schemas.schemas import RequestCreate, RequestStatusUpdate
from datetime import datetime
from crud.user_crud import create_user_from_request
from utils.email_utils import send_email
from utils.email_templates_utils import account_creation_email

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

async def update_request_status_and_process(request_id: int, status_update: RequestStatusUpdate, db: Session):
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    request.status = status_update.status
    db.commit()
    db.refresh(request)

    if status_update.status == 'accepted':
        try:
            new_user, reset_token = await create_user_from_request(db, request)
            reset_link = f"http://localhost:3000/reset-password?token={reset_token.token}"
            subject = "Welcome to Food Express - Set Your Password"
            body = account_creation_email(request.first_name, request.last_name, new_user.username, reset_link)
            await send_email(request.email, subject, body)
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return request

async def update_request_status(db: Session, request_id: int, status_update: RequestStatusUpdate):
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        return None
    request.status = status_update.status
    db.commit()
    db.refresh(request)
    return request
