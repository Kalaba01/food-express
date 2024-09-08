import base64
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from models.models import Restaurant, Image

async def get_top_restaurants(db: Session):
    result = db.query(Restaurant.id, Restaurant.name, Image.image)\
            .join(Image, Image.restaurant_id == Restaurant.id)\
            .filter(Restaurant.total_rating >= 4)\
            .distinct(Restaurant.id)\
            .limit(10)\
            .all()
    
    top_restaurants = []
    for restaurant_id, name, image in result:
        image_base64 = base64.b64encode(image).decode('utf-8')
        top_restaurants.append({
            "id": restaurant_id,
            "name": name,
            "image": f"data:image/jpeg;base64,{image_base64}"
        })
    
    return top_restaurants
