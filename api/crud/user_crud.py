import uuid
import base64
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from models.models import User, PasswordResetToken, Image
from schemas.schemas import UserCreate, UserUpdate
from utils.password_utils import (
    hash_password,
    verify_password,
    generate_temp_password,
    get_password_hash,
)
from datetime import datetime, timedelta

# Checks if a user with the given username or email already exists in the database
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

# Creates a new user in the database with a hashed password and specified role
async def create_user(db: Session, user: UserCreate, role: str):
    hashed_password = await hash_password(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=role,
        image_id=1,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Updates user details
async def update_user_details(user_id: int, user_update: UserUpdate, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.username:
        user.username = user_update.username
    if user_update.email:
        user.email = user_update.email
    if user_update.password:
        if await verify_password(user_update.password, user.hashed_password):
            raise HTTPException(
                status_code=400,
                detail="New password cannot be the same as the old password",
            )
        user.hashed_password = await hash_password(user_update.password)
    if user_update.role:
        user.role = user_update.role

    db.commit()
    db.refresh(user)
    return user

# Deletes a user from the database and also removes associated data
async def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.image_id:
        image = db.query(Image).filter(Image.id == user.image_id).first()
        if image:
            db.delete(image)

    for restaurant in user.owned_restaurants:
        db.delete(restaurant)

    for order in user.orders:
        db.query(OrderItem).filter(OrderItem.order_id == order.id).delete()
        db.query(OrderAssignment).filter(OrderAssignment.order_id == order.id).delete()
        db.delete(order)

    db.query(Courier).filter(Courier.user_id == user_id).delete()

    db.query(Chat).filter(
        (Chat.sender_id == user_id) | (Chat.receiver_id == user_id)
    ).delete()

    db.query(Notification).filter(Notification.user_id == user_id).delete()

    db.query(Rating).filter(
        Rating.order_id.in_([order.id for order in user.orders])
    ).delete()

    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).delete()

    if user.bank_account:
        db.delete(user.bank_account)

    db.delete(user)
    db.commit()

# Retrieves a user from the database by username
async def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

# Retrieves a user from the database by email
async def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# Creates a password reset token for a user that expires after 24 hours
async def create_password_reset_token(db: Session, user_id: int):
    token = str(uuid.uuid4())
    expiration_time = datetime.utcnow() + timedelta(hours=24)
    reset_token = PasswordResetToken(
        user_id=user_id, token=token, expiration=expiration_time
    )
    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)
    return reset_token

# Verifies if a given password reset token is valid and not expired
async def verify_password_reset_token(db: Session, token: str):
    reset_token = (
        db.query(PasswordResetToken).filter(PasswordResetToken.token == token).first()
    )
    if reset_token and reset_token.expiration > datetime.utcnow():
        return reset_token
    return None

# Updates the user's password and deletes associated password reset tokens
async def update_user_password(db: Session, user_id: int, new_password: str):
    user = db.query(User).filter(User.id == user_id).first()
    user.hashed_password = await hash_password(new_password)

    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).delete()

    db.commit()
    return user

# Generates a unique username for a user by combining their first and last name in various formats
async def generate_unique_username(db: Session, first_name: str, last_name: str):
    base_usernames = [
        f"{first_name.lower()}.{last_name.lower()}",
        f"{last_name.lower()}.{first_name.lower()}",
        f"{first_name.lower()}{last_name.lower()}",
        f"{last_name.lower()}{first_name.lower()}",
        f"{first_name.lower()}{last_name.lower()[:2]}",
        f"{last_name.lower()}{first_name.lower()[:2]}",
    ]
    for username in base_usernames:
        existing_user = await get_user_by_username(db, username)
        if not existing_user:
            return username
    raise Exception("Could not generate unique username")

# Creates a new user based on a request and generates a password reset token for the user to set their password
async def create_user_from_request(db: Session, request):
    username = await generate_unique_username(db, request.first_name, request.last_name)
    await check_user_exists(db, username=username, email=request.email)
    temp_password = await generate_temp_password()
    role = (
        "administrator"
        if request.request_type == "join"
        else "courier" if request.request_type == "deliver" else "owner"
    )
    user_create = UserCreate(
        username=username, email=request.email, password=temp_password
    )
    new_user = await create_user(db, user_create, role)
    reset_token = await create_password_reset_token(db, new_user.id)
    return new_user, reset_token

# Retrieves the profile information of a user
async def get_profile(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return None

    profile_picture = None
    if user.image_id:
        image = db.query(Image).filter(Image.id == user.image_id).first()
        if image:
            profile_picture = base64.b64encode(image.image).decode("utf-8")

    return {
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "profilePicture": profile_picture,
    }

# Updates a user's profile
async def update_user_profile(
    db: Session, user_id: int, username: str, email: str, profilePicture: UploadFile
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user.username = username
    user.email = email

    if profilePicture:
        image_data = await profilePicture.read()
        new_image = Image(image=image_data, item_id=None, restaurant_id=None)
        db.add(new_image)
        db.commit()
        db.refresh(new_image)

        user.image_id = new_image.id

    db.commit()

    profile_picture_base64 = (
        base64.b64encode(new_image.image).decode("utf-8") if new_image else None
    )

    return {
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "profilePicture": profile_picture_base64,
    }

# Changes a user's password, ensuring that the new password is different from the old one
async def change_user_password(
    db: Session, user_id: int, old_password: str, new_password: str
) -> bool:
    user = db.query(User).filter(User.id == user_id).first()

    if not user or not await verify_password(old_password, user.hashed_password):
        return False

    if await verify_password(new_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="New password cannot be the same as the old password",
        )

    user.hashed_password = get_password_hash(new_password)
    db.commit()

    return True
