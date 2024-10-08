from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.models import Courier, User, Restaurant
from schemas.schemas import CourierCreate, CourierUpdate

# Searches for restaurants by name
async def search_restaurants(db: Session, name: str):
    restaurants = db.query(Restaurant).filter(Restaurant.name.ilike(f"%{name}%")).all()
    return [
        {"id": restaurant.id, "name": restaurant.name} for restaurant in restaurants
    ]

# Searches for restaurants by name
async def search_couriers(db: Session, username: str):
    users = (
        db.query(User)
        .outerjoin(Courier, User.id == Courier.user_id)
        .filter(User.role == "courier", User.username.ilike(f"%{username}%"))
        .all()
    )
    return [{"id": user.id, "username": user.username} for user in users]

# Retrieves all couriers along with their associated details
async def get_all_couriers(db: Session):
    couriers = (
        db.query(Courier)
        .join(User, Courier.user_id == User.id)
        .join(Restaurant, Courier.restaurant_id == Restaurant.id)
        .all()
    )

    couriers_with_details = []
    for courier in couriers:
        couriers_with_details.append(
            {
                "id": courier.id,
                "user_name": courier.user.username,
                "restaurant_name": courier.restaurant.name,
                "latitude": courier.restaurant.latitude,
                "longitude": courier.restaurant.longitude,
                "vehicle_type": courier.vehicle_type.value,
                "wallet_amount": courier.wallet_amount,
                "halal_mode": courier.halal_mode,
            }
        )

    return couriers_with_details

# Creates a new courier and assigns them to a restaurant
async def create_courier(db: Session, courier: CourierCreate):
    existing_courier = (
        db.query(Courier)
        .filter(
            Courier.user_id == courier.user_id,
            Courier.restaurant_id == courier.restaurant_id,
        )
        .first()
    )

    if existing_courier:
        raise HTTPException(
            status_code=400, detail="Courier is already assigned to this restaurant."
        )

    new_courier = Courier(
        user_id=courier.user_id,
        vehicle_type=courier.vehicle_type,
        halal_mode=courier.halal_mode,
        wallet_amount=0,
        wallet_details=None,
        restaurant_id=courier.restaurant_id,
    )
    db.add(new_courier)
    db.commit()
    db.refresh(new_courier)
    return new_courier

# Updates an existing courier's information
async def update_courier(db: Session, courier_id: int, courier: CourierUpdate):
    existing_courier = db.query(Courier).filter(Courier.id == courier_id).first()
    if not existing_courier:
        raise HTTPException(status_code=404, detail="Courier not found")

    for key, value in courier.dict(exclude_unset=True).items():
        setattr(existing_courier, key, value)

    db.commit()
    db.refresh(existing_courier)
    return existing_courier

# Deletes a courier by their ID
async def delete_courier(db: Session, courier_id: int):
    existing_courier = db.query(Courier).filter(Courier.id == courier_id).first()
    if not existing_courier:
        raise HTTPException(status_code=404, detail="Courier not found")

    db.delete(existing_courier)
    db.commit()
    return {"message": "Courier deleted successfully"}
