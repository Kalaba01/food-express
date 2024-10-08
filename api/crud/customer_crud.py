import base64
from fastapi import HTTPException
from datetime import datetime
from sqlalchemy.orm import Session
from models.models import Restaurant, Item, MenuCategory, Image, OperatingHours
from utils.rating_utils import calculate_average_rating

# Searches for restaurants based on a query string and returns matching restaurants with details
async def search_restaurants(db: Session, query: str):
    results = db.query(Restaurant).filter(Restaurant.name.ilike(f"%{query}%")).all()

    if not results:
        return {"message": "No restaurants found matching your query"}

    response = []
    for restaurant in results:
        avg_rating = calculate_average_rating(
            restaurant.total_rating, restaurant.rating_count
        )
        response.append(
            {
                "id": restaurant.id,
                "name": restaurant.name,
                "rating": avg_rating,
                "address": restaurant.address,
                "city": restaurant.city,
                "category": restaurant.category,
                "contact": restaurant.contact,
            }
        )

    return response

# Searches for menu items based on a query string and returns matching items with restaurant details
async def search_items(db: Session, query: str):
    results = (
        db.query(Item, Restaurant.name.label("restaurant_name"))
        .join(Restaurant, Item.restaurant_id == Restaurant.id)
        .filter(Item.name.ilike(f"%{query}%"))
        .all()
    )

    if not results:
        return {"message": "No items found matching your query"}

    items = [
        {
            "id": item.Item.id,
            "name": item.Item.name,
            "description": item.Item.description,
            "price": item.Item.price,
            "restaurant_name": item.restaurant_name,
        }
        for item in results
    ]

    return items

# Retrieves detailed information about a specific restaurant
async def get_restaurant_details(db: Session, restaurant_name: str):
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.name.ilike(f"%{restaurant_name}%"))
        .first()
    )

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    restaurant_images = (
        db.query(Image).filter(Image.restaurant_id == restaurant.id).all()
    )

    operating_hours = (
        db.query(OperatingHours)
        .filter(OperatingHours.restaurant_id == restaurant.id)
        .all()
    )

    average_rating = calculate_average_rating(
        restaurant.total_rating, restaurant.rating_count
    )

    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "address": restaurant.address,
        "city": restaurant.city,
        "category": restaurant.category,
        "contact": restaurant.contact,
        "latitude": restaurant.latitude,
        "longitude": restaurant.longitude,
        "average_rating": average_rating,
        "images": [
            {
                "id": img.id,
                "image": f"data:image/png;base64,{base64.b64encode(img.image).decode('utf-8')}",
            }
            for img in restaurant_images
        ],
        "operating_hours": [
            {
                "day_of_week": hours.day_of_week,
                "opening_time": hours.opening_time.strftime("%H:%M"),
                "closing_time": hours.closing_time.strftime("%H:%M"),
            }
            for hours in operating_hours
        ],
    }

# Retrieves the menu of a specific restaurant
async def get_restaurant_menu(db: Session, restaurant_name: str):
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.name.ilike(f"%{restaurant_name}%"))
        .first()
    )

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    menu_categories = (
        db.query(MenuCategory).filter_by(restaurant_id=restaurant.id).all()
    )

    menu_data = []
    for category in menu_categories:
        items = db.query(Item).filter_by(menu_category_id=category.id).all()
        item_data = []
        for item in items:
            item_images = db.query(Image).filter_by(item_id=item.id).all()
            item_data.append(
                {
                    "id": item.id,
                    "name": item.name,
                    "description": item.description,
                    "price": item.price,
                    "category": item.category,
                    "restaurant_id": restaurant.id,
                    "images": [
                        {
                            "id": img.id,
                            "image": f"data:image/png;base64,{base64.b64encode(img.image).decode('utf-8')}",
                        }
                        for img in item_images
                    ],
                }
            )
        menu_data.append(
            {
                "category_name": category.name,
                "category_description": category.description,
                "items": item_data,
            }
        )

    return menu_data
