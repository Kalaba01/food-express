import uuid
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine, get_db
from models.models import Base, User, Request, RequestStatus, PasswordResetToken
from schemas.schemas import UserCreate, RequestCreate, ForgotPasswordRequest
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
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Provjera korisničkog imena
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Provjera emaila
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Kreiranje novog korisnika
    hashed_password = hash_password(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password, role='customer')
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Slanje welcome emaila
    subject = "Welcome to Food Express"
    body = f"Hi {new_user.username},\n\nWelcome to Food Express! We're excited to have you on board."
    send_email(new_user.email, subject, body)
    
    return new_user

@app.post("/token")
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == form_data.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    if not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    user_data = {
        "sub": db_user.username,
        "id": db_user.id,
        "email": db_user.email,
        "role": db_user.role
    }
    access_token = create_access_token(data=user_data)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Rute za proveru korisničkog imena i email adrese
@app.get("/check-username/{username}")
def check_username(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    return {"exists": bool(user)}

@app.get("/check-email/{email}")
def check_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    return {"exists": bool(user)}

@app.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
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
    send_email(user.email, "Reset Your Password", f"Click the link to reset your password: {reset_link}")
    return {"message": "If the email exists, a reset link has been sent."}

@app.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    reset_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == token).first()
    if not reset_token or reset_token.expiration < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if verify_password(new_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="New password cannot be the same as the current password")

    user.hashed_password = hash_password(new_password)
    db.delete(reset_token)
    db.commit()
    return {"message": "Password reset successful"}
