import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine, get_db
from models.models import Base, User, PasswordResetToken
from schemas.schemas import UserCreate, ForgotPasswordRequest
from auth.auth import create_access_token, get_current_user
from utils.password_utils import hash_password, verify_password
from utils.email_utils import send_email
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

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

# Kreiranje tabela prilikom pokretanja aplikacije
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
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password, role='customer')
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
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.username == form_data.username))
    db_user = result.scalars().first()
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

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

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
