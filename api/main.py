import os
import asyncio
import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine, get_db
from models.models import Base, User, PasswordResetToken, Image, Request
from schemas.schemas import UserCreate, ForgotPasswordRequest, ImageCreate, RequestCreate, RequestStatusUpdate, UserUpdate
from auth.auth import create_access_token, get_current_user
from utils.password_utils import hash_password, verify_password, generate_temp_password
from utils.email_utils import send_email
from utils.email_templates_utils import welcome_email, reset_password_email, request_denied_email, request_reminder_email, account_creation_email
from utils.scheduled_tasks_utils import deny_requests_and_send_emails, remind_pending_requests
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from crud.user_crud import create_user, get_user_by_username, get_user_by_email, create_password_reset_token, verify_password_reset_token, update_user_password, check_user_exists, create_user_from_request
from crud.request_crud import create_request, get_all_requests, update_request_status

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

# Dodavanje zadataka u APScheduler
scheduler = BackgroundScheduler()
scheduler.add_job(lambda: asyncio.run(deny_requests_and_send_emails()), CronTrigger(hour=0, minute=0))
scheduler.add_job(lambda: asyncio.run(remind_pending_requests()), CronTrigger(hour=0, minute=1))
scheduler.start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    await check_user_exists(db, user.username, user.email)
    
    new_user = await create_user(db, user, role='customer')
    
    subject = "Welcome to Food Express"
    body = welcome_email(new_user.username)
    await send_email(new_user.email, subject, body)
    
    return new_user

@app.post("/token")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = await get_user_by_username(db, form_data.username)
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
    user = await get_user_by_username(db, username)
    return {"exists": bool(user)}

@app.get("/check-email/{email}")
async def check_email(email: str, db: Session = Depends(get_db)):
    user = await get_user_by_email(db, email)
    return {"exists": bool(user)}

@app.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = request.email
    user = await get_user_by_email(db, email)
    if not user:
        return {"message": "If the email exists, a reset link has been sent."}
    reset_token = await create_password_reset_token(db, user.id)

    reset_link = f"http://localhost:3000/reset-password?token={reset_token.token}"
    subject = "Reset Your Password - Food Express"
    body = reset_password_email(user.username, reset_link)
    await send_email(user.email, subject, body)
    
    return {"message": "If the email exists, a reset link has been sent."}

@app.post("/reset-password")
async def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    reset_token = await verify_password_reset_token(db, token)
    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if await verify_password(new_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="New password cannot be the same as the current password")

    await update_user_password(db, user.id, new_password)
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
async def create_request_endpoint(request: RequestCreate, db: Session = Depends(get_db)):
    new_request = await create_request(db, request)
    return new_request

@app.get("/requests/")
async def read_requests(db: Session = Depends(get_db)):
    return await get_all_requests(db)

@app.put("/requests/{request_id}")
async def update_request_status_endpoint(request_id: int, status_update: RequestStatusUpdate, db: Session = Depends(get_db)):
    request = await update_request_status(db, request_id, status_update)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

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

@app.get("/users/")
async def read_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.put("/users/{user_id}")
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.username:
        user.username = user_update.username
    if user_update.email:
        user.email = user_update.email
    if user_update.password:
        if await verify_password(user_update.password, user.hashed_password):
            raise HTTPException(status_code=400, detail="New password cannot be the same as the old password")
        user.hashed_password = await hash_password(user_update.password)
    if user_update.role:
        user.role = user_update.role
    
    db.commit()
    db.refresh(user)
    return user
