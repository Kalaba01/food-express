import base64
from typing import List
from datetime import datetime, time
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.models import (
    Restaurant,
    MenuCategory,
    Item,
    User,
    DeliveryZone,
    RestaurantDeliveryZone,
    OperatingHours,
)
from schemas.schemas import (
    RestaurantCreate,
    RestaurantUpdate,
    OperatingHoursUpdate
)

# Retrieves all restaurants owned by the current user
async def get_restaurants_for_owner(db: Session, current_user: User):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    restaurants = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).all()
    return restaurants

# Updates the operating hours for a specific restaurant
async def update_operating_hours(
    db: Session, restaurant_id: int, operating_hours: List[OperatingHoursUpdate]
):
    existing_hours = (
        db.query(OperatingHours)
        .filter(OperatingHours.restaurant_id == restaurant_id)
        .all()
    )

    for hour in operating_hours:
        if hour.id:
            db_hour = (
                db.query(OperatingHours).filter(OperatingHours.id == hour.id).first()
            )
            if db_hour:
                db_hour.opening_time = hour.opening_time
                db_hour.closing_time = hour.closing_time
        else:
            new_hour = OperatingHours(
                restaurant_id=restaurant_id,
                day_of_week=hour.day_of_week,
                opening_time=hour.opening_time,
                closing_time=hour.closing_time,
            )
            db.add(new_hour)

    db.commit()

# Retrieves all restaurants from the database
async def get_all_restaurants(db: Session):
    return db.query(Restaurant).all()

# Retrieves a specific restaurant by its ID and checks ownership
async def get_restaurant_by_id(db: Session, restaurant_id: int, user_id: int):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    if restaurant.owner_id != user_id:
        raise HTTPException(status_code=403, detail="You do not own this restaurant")

    delivery_zone_ids = [zone.delivery_zone_id for zone in restaurant.delivery_zones]

    images = [
        {"id": image.id, "image": base64.b64encode(image.image).decode("utf-8")}
        for image in restaurant.images
    ]

    operating_hours = [
        {
            "id": hours.id,
            "day_of_week": hours.day_of_week,
            "opening_time": hours.opening_time.strftime("%H:%M"),
            "closing_time": hours.closing_time.strftime("%H:%M"),
        }
        for hours in restaurant.operating_hours
    ]

    restaurant_data = {
        **restaurant.__dict__,
        "delivery_zone_ids": delivery_zone_ids,
        "images": images,
        "operating_hours": operating_hours,
    }

    return restaurant_data

# Creates a new restaurant and adds delivery zones and default operating hours
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
        capacity=restaurant.capacity,
    )

    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)

    days_of_week = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]
    opening_time = time(9, 0)
    closing_time = time(21, 0)

    for day in days_of_week:
        operating_hours = OperatingHours(
            restaurant_id=new_restaurant.id,
            day_of_week=day,
            opening_time=opening_time,
            closing_time=closing_time,
        )
        db.add(operating_hours)

    zones = (
        db.query(DeliveryZone)
        .filter(DeliveryZone.id.in_(restaurant.delivery_zone_ids))
        .all()
    )
    if not zones:
        raise HTTPException(status_code=400, detail="Invalid delivery zone IDs")

    for zone in zones:
        restaurant_delivery_zone = RestaurantDeliveryZone(
            restaurant_id=new_restaurant.id, delivery_zone_id=zone.id
        )
        db.add(restaurant_delivery_zone)

    db.commit()
    db.refresh(new_restaurant)
    return new_restaurant

# Updates an existing restaurant's details
async def update_existing_restaurant(
    db: Session, restaurant_id: int, restaurant: RestaurantUpdate
):
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
        db.query(RestaurantDeliveryZone).filter(
            RestaurantDeliveryZone.restaurant_id == restaurant_id
        ).delete()
        for zone_id in restaurant.delivery_zone_ids:
            restaurant_delivery_zone = RestaurantDeliveryZone(
                restaurant_id=db_restaurant.id, delivery_zone_id=zone_id
            )
            db.add(restaurant_delivery_zone)

    if restaurant.operating_hours is not None:
        await update_operating_hours(db, restaurant_id, restaurant.operating_hours)

    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

# Deletes a restaurant and all associated menus, items, and delivery zones
async def delete_restaurant_and_related_data(db: Session, restaurant_id: int):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    db.query(RestaurantDeliveryZone).filter(
        RestaurantDeliveryZone.restaurant_id == restaurant_id
    ).delete()

    menu_categories = (
        db.query(MenuCategory).filter(MenuCategory.restaurant_id == restaurant_id).all()
    )
    for category in menu_categories:
        db.query(Item).filter(Item.menu_category_id == category.id).delete()

    db.query(MenuCategory).filter(MenuCategory.restaurant_id == restaurant_id).delete()

    db.delete(db_restaurant)
    db.commit()

    return {
        "message": "Restaurant and all associated menus, items, and delivery zones deleted successfully"
    }

# Retrieves all items for a specific restaurant
async def get_items(db: Session, restaurant_id: int):
    items = db.query(Item).filter_by(restaurant_id=restaurant_id).all()

    items_data = []
    for item in items:
        item_data = {
            **item.__dict__,
            "images": [image.image for image in item.images],
            "category_name": item.menu_category.name if item.menu_category else None,
        }
        items_data.append(item_data)

    return items_data
