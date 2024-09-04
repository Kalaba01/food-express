from sqlalchemy.orm import Session
from models.models import Courier, User, Restaurant
from schemas.schemas import CourierCreate, CourierUpdate

async def search_restaurants(db: Session, name: str):
    restaurants = db.query(Restaurant).filter(Restaurant.name.ilike(f"%{name}%")).all()
    return [{"id": restaurant.id, "name": restaurant.name} for restaurant in restaurants]

async def search_couriers(db: Session, username: str):
    users = db.query(User).outerjoin(Courier, User.id == Courier.user_id).filter(
        # Courier.user_id == None,
        User.role == 'courier',  # Filtriraj samo korisnike koji su kuriri
        User.username.ilike(f"%{username}%")
    ).all()
    return [{"id": user.id, "username": user.username} for user in users]

# Funkcija za dohvatanje svih kurira
async def get_all_couriers(db: Session):
    couriers = (
        db.query(Courier)
        .join(User, Courier.user_id == User.id)
        .join(Restaurant, Courier.restaurant_id == Restaurant.id)
        .all()
    )

    couriers_with_details = []
    for courier in couriers:
        couriers_with_details.append({
            "id": courier.id,
            "user_name": courier.user.username,
            "restaurant_name": courier.restaurant.name,
            "vehicle_type": courier.vehicle_type.value,
            "wallet_amount": courier.wallet_amount,
            "halal_mode": courier.halal_mode,
        })

    return couriers_with_details

# Funkcija za kreiranje novog kurira
from fastapi import HTTPException

async def create_courier(db: Session, courier: CourierCreate):
    # Provera da li kurir već radi za neki restoran
    existing_courier = db.query(Courier).filter(Courier.user_id == courier.user_id).first()
    if existing_courier:
        raise HTTPException(status_code=400, detail="Courier is already assigned to a restaurant.")
    
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

# Funkcija za ažuriranje postojećeg kurira
async def update_courier(db: Session, courier_id: int, courier: CourierUpdate):
    existing_courier = db.query(Courier).filter(Courier.id == courier_id).first()
    if not existing_courier:
        raise HTTPException(status_code=404, detail="Courier not found")

    for key, value in courier.dict(exclude_unset=True).items():
        setattr(existing_courier, key, value)

    db.commit()
    db.refresh(existing_courier)
    return existing_courier

# Funkcija za brisanje kurira
async def delete_courier(db: Session, courier_id: int):
    existing_courier = db.query(Courier).filter(Courier.id == courier_id).first()
    if not existing_courier:
        raise HTTPException(status_code=404, detail="Courier not found")

    db.delete(existing_courier)
    db.commit()
    return {"message": "Courier deleted successfully"}
