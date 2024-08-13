from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Restaurant, MenuCategory, Item, User
from schemas.schemas import RestaurantCreate, RestaurantUpdate

async def get_all_restaurants(db: Session):
    return db.query(Restaurant).all()

async def get_restaurant_by_id(db: Session, restaurant_id: int):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        return None

    # Prikupljanje ID-ova zona dostave vezanih za ovaj restoran
    delivery_zone_ids = [
        zone.delivery_zone_id for zone in restaurant.delivery_zones
    ]

    # Dodavanje delivery_zone_ids u vraćeni odgovor
    restaurant_data = {
        **restaurant.__dict__,
        "delivery_zone_ids": delivery_zone_ids
    }

    return restaurant_data

async def search_owners(db: Session, username: str):
    owners = db.query(User).filter(User.username.ilike(f"%{username}%")).all()
    return [{"id": owner.id, "username": owner.username} for owner in owners if owner.role == "owner"]

async def create_new_restaurant(db: Session, restaurant: RestaurantCreate):
    owner = db.query(User).filter(User.id == restaurant.owner_id).first()
    if not owner or owner.role != "owner":
        raise HTTPException(status_code=400, detail="Invalid owner ID")

    new_restaurant = Restaurant(
        name=restaurant.name,
        address=restaurant.address,
        city=restaurant.city,
        latitude=restaurant.latitude,
        longitude=restaurant.longitude,
        category=restaurant.category,
        contact=restaurant.contact,
        owner_id=restaurant.owner_id,
        capacity=restaurant.capacity
    )

    zones = db.query(DeliveryZone).filter(DeliveryZone.id.in_(restaurant.delivery_zone_ids)).all()
    if not zones:
        raise HTTPException(status_code=400, detail="Invalid delivery zone IDs")
    
    new_restaurant.delivery_zones.extend(zones)

    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)
    return new_restaurant

async def update_existing_restaurant(db: Session, restaurant_id: int, restaurant: RestaurantUpdate):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if restaurant.owner_id:
        owner = db.query(User).filter(User.id == restaurant.owner_id).first()
        if not owner or owner.role != "owner":
            raise HTTPException(status_code=400, detail="Invalid owner ID")

    if restaurant.name is not None:
        db_restaurant.name = restaurant.name
    if restaurant.address is not None:
        db_restaurant.address = restaurant.address
    if restaurant.city is not None:
        db_restaurant.city = restaurant.city
    if restaurant.latitude is not None:
        db_restaurant.latitude = restaurant.latitude
    if restaurant.longitude is not None:
        db_restaurant.longitude = restaurant.longitude
    if restaurant.category is not None:
        db_restaurant.category = restaurant.category
    if restaurant.contact is not None:
        db_restaurant.contact = restaurant.contact
    if restaurant.capacity is not None:
        db_restaurant.capacity = restaurant.capacity
    
    if restaurant.delivery_zone_ids is not None:
        zones = db.query(DeliveryZone).filter(DeliveryZone.id.in_(restaurant.delivery_zone_ids)).all()
        if not zones:
            raise HTTPException(status_code=400, detail="Invalid delivery zone IDs")
        db_restaurant.delivery_zones = zones

    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

async def delete_restaurant_and_related_data(db: Session, restaurant_id: int):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    menu_categories = db.query(MenuCategory).filter(MenuCategory.restaurant_id == restaurant_id).all()
    for category in menu_categories:
        db.query(Item).filter(Item.menu_category_id == category.id).delete()
    
    db.query(MenuCategory).filter(MenuCategory.restaurant_id == restaurant_id).delete()

    db.delete(db_restaurant)
    db.commit()
    
    return {"message": "Restaurant and all associated menus and items deleted successfully"}
