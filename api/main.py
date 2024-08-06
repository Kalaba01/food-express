import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine, get_db
from models.models import Base, User, PasswordResetToken, Image, Request
from schemas.schemas import UserCreate, ForgotPasswordRequest, ImageCreate, RequestCreate, RequestStatusUpdate
from auth.auth import create_access_token, get_current_user
from utils.password_utils import hash_password, verify_password
from utils.email_utils import send_email
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import os
import asyncio

def start_application():
    app = FastAPI()
    origins = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )
    return app

app = start_application()

Base.metadata.create_all(bind=engine)

@app.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = await hash_password(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role='customer',
        image_id=1
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    subject = "Welcome to Food Express"
    body = (
        f"Dear {new_user.username},\n\n"
        "Welcome to Food Express! We are thrilled to have you join our community of food lovers. Our platform offers you the best dining experiences, whether you want to explore new restaurants or enjoy your favorite meals at home.\n\n"
        "Here are some key features you can enjoy:\n"
        "1. Wide Selection of Restaurants: Browse through a variety of restaurants offering different cuisines.\n"
        "2. Exclusive Offers and Discounts: Stay tuned for special offers and discounts exclusively available to our members.\n"
        "3. Easy and Secure Payments: Pay for your orders securely using our integrated payment gateway.\n"
        "4. Order Tracking: Track your orders in real-time from the restaurant to your doorstep.\n\n"
        "To get started, simply log in to your account and explore the wide range of restaurants and cuisines available. If you have any questions or need assistance, our customer support team is here to help. You can reach us at foodexpressproject@outlook.com or visit our Help Center.\n\n"
        "We hope you enjoy your experience with Food Express. Bon appétit!\n\n"
        "Best regards,\n"
        "The Food Express Team\n"
        "https://www.foodexpress.com\n\n"
        "P.S. Don't forget to follow us on social media for the latest updates and promotions!"
    )
    await send_email(new_user.email, subject, body)
    
    return new_user

@app.post("/token")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == form_data.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    if not await verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    user_data = {
        "sub": db_user.username,
        "id": db_user.id,
        "email": db_user.email,
        "role": db_user.role
    }
    access_token = await create_access_token(data=user_data)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/check-username/{username}")
async def check_username(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    return {"exists": bool(user)}

@app.get("/check-email/{email}")
async def check_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    return {"exists": bool(user)}

@app.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = request.email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"message": "If the email exists, a reset link has been sent."}
    token = str(uuid.uuid4())
    expiration_time = datetime.utcnow() + timedelta(hours=1)
    reset_token = PasswordResetToken(user_id=user.id, token=token, expiration=expiration_time)
    db.add(reset_token)
    db.commit()

    reset_link = f"http://localhost:3000/reset-password?token={token}"
    subject = "Reset Your Password - Food Express"
    body = (
        f"Dear {user.username},\n\n"
        "We received a request to reset your password for your Food Express account. If you did not request a password reset, please ignore this email. Otherwise, you can reset your password using the link below:\n\n"
        f"Reset Password Link: {reset_link}\n\n"
        "This link is valid for one hour from the time of receipt. If the link expires, you can request a new one by visiting the 'Forgot Password' section on our website.\n\n"
        "For security reasons, we recommend that you do not share this link with anyone. If you encounter any issues or need further assistance, please contact our support team at foodexpressproject@outlook.com.\n\n"
        "Thank you for choosing Food Express. We value your security and privacy.\n\n"
        "Best regards,\n"
        "The Food Express Team\n"
        "https://www.foodexpress.com\n\n"
        "P.S. For more tips on account security, visit our Help Center."
    )
    await send_email(user.email, subject, body)
    
    return {"message": "If the email exists, a reset link has been sent."}

@app.post("/reset-password")
async def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    reset_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == token).first()
    if not reset_token or reset_token.expiration < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if await verify_password(new_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="New password cannot be the same as the current password")

    user.hashed_password = await hash_password(new_password)
    db.delete(reset_token)
    db.commit()
    return {"message": "Password reset successful"}

@app.post("/upload-image/")
async def upload_image(item_id: int = None, restaurant_id: int = None, file: UploadFile = File(...), db: Session = Depends(get_db)):
    image_data = await file.read()
    new_image = Image(image=image_data, item_id=item_id, restaurant_id=restaurant_id)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return {"message": "Image uploaded successfully", "image_id": new_image.id}

@app.post("/requests/")
async def create_request(request: RequestCreate, db: Session = Depends(get_db)):
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

@app.get("/requests/")
def read_requests(db: Session = Depends(get_db)):
    return db.query(Request).all()

@app.put("/requests/{request_id}")
async def update_request_status(request_id: int, status_update: RequestStatusUpdate, db: Session = Depends(get_db)):
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    request.status = status_update.status
    db.commit()
    db.refresh(request)
    return request

# Funkcija za promenu statusa i slanje emailova za odbijene zahteve
async def deny_requests_and_send_emails():
    db = SessionLocal()
    try:
        requests = db.query(Request).filter(Request.additional_info == None, Request.status == "pending").all()
        for request in requests:
            request.status = "denied"
            db.add(request)
            subject = "Your Request Has Been Denied"
            body = (
                f"Dear {request.first_name} {request.last_name},\n\n"
                "After a thorough review of your request, we regret to inform you that it has been denied.\n"
                "We appreciate your interest in joining us and encourage you to apply again in the future.\n\n"
                "If you have any questions or need further assistance, please do not hesitate to contact us at foodexpressproject@outlook.com.\n\n"
                "Best regards,\n"
                "The Food Express Team\n"
                "https://www.foodexpress.com"
            )
            await send_email(request.email, subject, body)
        db.commit()
    except Exception as e:
        print(f"Error while changing status and sending emails: {e}")
    finally:
        db.close()

# Funkcija za slanje emailova za zahteve u obradi
async def remind_pending_requests():
    db = SessionLocal()
    try:
        requests = db.query(Request).filter(Request.status == "pending").all()
        for request in requests:
            subject = "Your Request is Still Under Review"
            body = (
                f"Dear {request.first_name} {request.last_name},\n\n"
                "Thank you for your patience. We wanted to let you know that your request is still under review and will be processed as soon as possible.\n\n"
                "We appreciate your understanding and will get back to you with an update shortly.\n\n"
                "If you have any questions in the meantime, please feel free to contact us at foodexpressproject@outlook.com.\n\n"
                "Best regards,\n"
                "The Food Express Team\n"
                "https://www.foodexpress.com"
            )
            await send_email(request.email, subject, body)
    except Exception as e:
        print(f"Error while sending reminder emails: {e}")
    finally:
        db.close()

# Dodavanje zadataka u APScheduler
scheduler = BackgroundScheduler()
scheduler.add_job(lambda: asyncio.run(deny_requests_and_send_emails()), CronTrigger(hour=0, minute=0))
scheduler.add_job(lambda: asyncio.run(remind_pending_requests()), CronTrigger(hour=0, minute=1))
scheduler.start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
