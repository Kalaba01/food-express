from sqlalchemy.orm import Session
from models.models import User, Restaurant
import schemas.schemas as schemas

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = User(username=user.username, email=user.email, hashed_password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_restaurant(db: Session, restaurant_id: int):
    return db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

def create_restaurant(db: Session, restaurant: schemas.RestaurantCreate):
    db_restaurant = Restaurant(
        name=restaurant.name,
        address=restaurant.address,
        city=restaurant.city,
        latitude=restaurant.latitude,
        longitude=restaurant.longitude,
        rating=restaurant.rating,
        category=restaurant.category,
    )
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant
