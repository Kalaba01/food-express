import base64
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Restaurant, MenuCategory, Item, User
from schemas.schemas import RestaurantCreate, RestaurantUpdate, MenuCategoryCreate, MenuCategoryUpdate, ItemCreate, ItemUpdate

async def get_all_restaurants(db: Session):
    return db.query(Restaurant).all()

async def get_restaurant_by_id(db: Session, restaurant_id: int):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        return None

    delivery_zone_ids = [
        zone.delivery_zone_id for zone in restaurant.delivery_zones
    ]

    # Modifikacija dijela za slike
    images = [
        {"id": image.id, "image": base64.b64encode(image.image).decode('utf-8')}
        for image in restaurant.images
    ]

    restaurant_data = {
        **restaurant.__dict__,
        "delivery_zone_ids": delivery_zone_ids,
        "images": images,
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
    if restaurant.address is not None:  # Provjeri da li je address poslan
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

# Dohvatanje svih kategorija za dati restoran
async def get_categories(db: Session, restaurant_id: int):
    return db.query(MenuCategory).filter_by(restaurant_id=restaurant_id).all()

# Kreiranje nove kategorije
async def create_category(db: Session, restaurant_id: int, category: MenuCategoryCreate):
    new_category = MenuCategory(
        name=category.name,
        description=category.description,
        restaurant_id=restaurant_id
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

# Uređivanje postojeće kategorije
async def update_category(db: Session, restaurant_id: int, category_id: int, category: MenuCategoryUpdate):
    db_category = db.query(MenuCategory).filter_by(id=category_id, restaurant_id=restaurant_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category.dict(exclude_unset=True).items():
        setattr(db_category, key, value)
    
    db.commit()
    return db_category

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

# Kreiranje novog artikla
async def create_item(db: Session, restaurant_id: int, item: ItemCreate):
    new_item = Item(
        name=item.name,
        description=item.description,
        price=item.price,
        weight=item.weight,
        preparation_time=item.preparation_time,
        restaurant_id=restaurant_id,
        menu_category_id=item.menu_category_id,
        category=item.category
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

# Uređivanje postojećeg artikla
async def update_item(db: Session, restaurant_id: int, item_id: int, item: ItemUpdate):
    db_item = db.query(Item).filter_by(id=item_id, restaurant_id=restaurant_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    for key, value in item.dict(exclude_unset=True).items():
        setattr(db_item, key, value)
    
    db.commit()
    return db_item
