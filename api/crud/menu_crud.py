from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.models import MenuCategory
from schemas.schemas import MenuCategoryCreate, MenuCategoryUpdate

# Retrieves all menu categories for a specific restaurant by restaurant_id
async def get_categories(db: Session, restaurant_id: int):
    return db.query(MenuCategory).filter_by(restaurant_id=restaurant_id).all()

# Creates a new menu category for a restaurant based on the provided data
async def create_category(db: Session, restaurant_id: int, category: MenuCategoryCreate):
    new_category = MenuCategory(
        name=category.name,
        description=category.description,
        restaurant_id=restaurant_id,
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

# Updates an existing menu category with the provided data
async def update_category(db: Session, restaurant_id: int, category_id: int, category: MenuCategoryUpdate):
    db_category = (
        db.query(MenuCategory)
        .filter_by(id=category_id, restaurant_id=restaurant_id)
        .first()
    )
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    for key, value in category.dict(exclude_unset=True).items():
        setattr(db_category, key, value)

    db.commit()
    return db_category
