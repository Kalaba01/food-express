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
        image_id=1,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


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


async def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Brisanje slike povezane sa korisnikom
    if user.image_id:
        image = db.query(Image).filter(Image.id == user.image_id).first()
        if image:
            db.delete(image)

    # Brisanje restorana koje korisnik posjeduje
    for restaurant in user.owned_restaurants:
        db.delete(restaurant)

    # Brisanje narudžbi koje je korisnik napravio
    for order in user.orders:
        # Brisanje stavki narudžbe
        db.query(OrderItem).filter(OrderItem.order_id == order.id).delete()
        # Brisanje dodjela narudžbi dostavljačima
        db.query(OrderAssignment).filter(OrderAssignment.order_id == order.id).delete()
        db.delete(order)

    # Brisanje kurira povezanih sa korisnikom
    db.query(Courier).filter(Courier.user_id == user_id).delete()

    # Brisanje poruka (chats)
    db.query(Chat).filter(
        (Chat.sender_id == user_id) | (Chat.receiver_id == user_id)
    ).delete()

    # Brisanje notifikacija
    db.query(Notification).filter(Notification.user_id == user_id).delete()

    # Brisanje ocjena (ratings)
    db.query(Rating).filter(
        Rating.order_id.in_([order.id for order in user.orders])
    ).delete()

    # Brisanje tokena za reset lozinke
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).delete()

    # Brisanje bankovnog računa povezanog sa korisnikom
    if user.bank_account:
        db.delete(user.bank_account)

    # Konačno brisanje korisnika
    db.delete(user)
    db.commit()


async def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


async def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


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


async def verify_password_reset_token(db: Session, token: str):
    reset_token = (
        db.query(PasswordResetToken).filter(PasswordResetToken.token == token).first()
    )
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
        f"{last_name.lower()}{first_name.lower()[:2]}",
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


async def update_user_profile(
    db: Session, user_id: int, username: str, email: str, profilePicture: UploadFile
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Ažuriraj korisničko ime i email ako su dostavljeni
    user.username = username
    user.email = email

    # Ako postoji nova slika profila, sačuvaj je u tabelu Images
    if profilePicture:
        image_data = await profilePicture.read()
        new_image = Image(image=image_data, item_id=None, restaurant_id=None)
        db.add(new_image)
        db.commit()
        db.refresh(new_image)

        # Postavi ID nove slike u kolonu image_id u tabeli Users
        user.image_id = new_image.id

    db.commit()

    # Base64 enkodovanje slike za JSON odgovor
    profile_picture_base64 = (
        base64.b64encode(new_image.image).decode("utf-8") if new_image else None
    )

    return {
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "profilePicture": profile_picture_base64,
    }


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
