import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.models import User, PasswordResetToken
from schemas.schemas import UserCreate
from utils.password_utils import hash_password, generate_temp_password
from datetime import datetime, timedelta

async def check_user_exists(db: Session, username: str = None, email: str = None):
    if username:
        db_user = db.query(User).filter(User.username == username).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")

    if email:
        db_user = db.query(User).filter(User.email == email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    return False

async def create_user(db: Session, user: UserCreate, role: str):
    hashed_password = await hash_password(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=role,
        image_id=1
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

async def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

async def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

async def create_password_reset_token(db: Session, user_id: int):
    token = str(uuid.uuid4())
    expiration_time = datetime.utcnow() + timedelta(hours=24)
    reset_token = PasswordResetToken(user_id=user_id, token=token, expiration=expiration_time)
    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)
    return reset_token

async def verify_password_reset_token(db: Session, token: str):
    reset_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == token).first()
    if reset_token and reset_token.expiration > datetime.utcnow():
        return reset_token
    return None

async def update_user_password(db: Session, user_id: int, new_password: str):
    user = db.query(User).filter(User.id == user_id).first()
    user.hashed_password = await hash_password(new_password)
    
    # Obriši sve povezane reset tokene za korisnika
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).delete()
    
    db.commit()
    return user

async def generate_unique_username(db: Session, first_name: str, last_name: str):
    base_usernames = [
        f"{first_name.lower()}.{last_name.lower()}",
        f"{last_name.lower()}.{first_name.lower()}",
        f"{first_name.lower()}{last_name.lower()}",
        f"{last_name.lower()}{first_name.lower()}",
        f"{first_name.lower()}{last_name.lower()[:2]}",
        f"{last_name.lower()}{first_name.lower()[:2]}"
    ]
    for username in base_usernames:
        existing_user = await get_user_by_username(db, username)
        if not existing_user:
            return username
    raise Exception("Could not generate unique username")

async def create_user_from_request(db: Session, request):
    username = await generate_unique_username(db, request.first_name, request.last_name)
    await check_user_exists(db, username=username, email=request.email)
    temp_password = await generate_temp_password()
    role = 'administrator' if request.request_type == 'join' else 'courier' if request.request_type == 'deliver' else 'partner'
    user_create = UserCreate(username=username, email=request.email, password=temp_password)
    new_user = await create_user(db, user_create, role)
    reset_token = await create_password_reset_token(db, new_user.id)
    return new_user, reset_token
