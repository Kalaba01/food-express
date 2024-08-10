from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import MenuCategory
from schemas.schemas import MenuCategoryCreate, MenuCategoryUpdate

async def get_menu_categories(db: Session, restaurant_id: int):
    return db.query(MenuCategory).filter(MenuCategory.restaurant_id == restaurant_id).all()

async def create_menu_category(db: Session, menu_category: MenuCategoryCreate):
    new_category = MenuCategory(**menu_category.dict())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

async def update_menu_category(db: Session, category_id: int, menu_category: MenuCategoryUpdate):
    db_category = db.query(MenuCategory).filter(MenuCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Menu category not found")
    for key, value in menu_category.dict(exclude_unset=True).items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category

async def delete_menu_category(db: Session, category_id: int):
    db_category = db.query(MenuCategory).filter(MenuCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Menu category not found")
    db.delete(db_category)
    db.commit()
    return {"message": "Menu category deleted successfully"}
