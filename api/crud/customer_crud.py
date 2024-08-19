from sqlalchemy.orm import Session
from models.models import Restaurant, Item
from utils.rating_utils import calculate_average_rating

async def search_restaurants(db: Session, query: str):
    results = db.query(Restaurant).filter(Restaurant.name.ilike(f"%{query}%")).all()

    if not results:
        return {"message": "No restaurants found matching your query"}

    response = []
    for restaurant in results:
        avg_rating = calculate_average_rating(restaurant.total_rating, restaurant.rating_count)
        response.append({
            "name": restaurant.name,
            "rating": avg_rating,
            "address": restaurant.address,
            "city": restaurant.city,
            "category": restaurant.category,
            "contact": restaurant.contact
        })
    
    return response

async def search_items(db: Session, query: str):
    results = db.query(Item).filter(Item.name.ilike(f"%{query}%")).all()
    if not results:
        return {"message": "No items found matching your query"}
    return results
