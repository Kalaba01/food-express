from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Restaurant, MenuCategory, Item
from schemas.schemas import RestaurantCreate, RestaurantUpdate

async def get_all_restaurants(db: Session):
    return db.query(Restaurant).all()

async def create_new_restaurant(db: Session, restaurant: RestaurantCreate):
    new_restaurant = Restaurant(**restaurant.dict())
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)
    return new_restaurant

async def update_existing_restaurant(db: Session, restaurant_id: int, restaurant: RestaurantUpdate):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    for key, value in restaurant.dict(exclude_unset=True).items():
        setattr(db_restaurant, key, value)
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
