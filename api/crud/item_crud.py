import base64
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from models.models import Item, Image
from schemas.schemas import ItemCreate, ItemUpdate


async def get_items(db: Session, category_id: int):
    items = db.query(Item).filter(Item.menu_category_id == category_id).all()

    result = []
    for item in items:
        item_data = {
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "weight": item.weight,
            "restaurant_id": item.restaurant_id,
            "price": item.price,
            "preparation_time": item.preparation_time,
            "category": item.category.value,
            "menuCategory": (
                item.menu_category.name if item.menu_category else None
            ),  # Dodajemo naziv kategorije menija
            "images": [],
        }

        # Dodaj slike ako postoje
        for image in item.images:
            image_data = {
                "id": image.id,
                "image": f"data:image/jpeg;base64,{base64.b64encode(image.image).decode('utf-8')}",
            }
            item_data["images"].append(image_data)

        result.append(item_data)

    return result


async def create_item(db: Session, restaurant_id: int, item: ItemCreate):
    # Ručno mapiranje polja iz item-a na Item model
    new_item = Item(
        name=item.name,
        description=item.description,
        price=item.price,
        weight=item.weight,
        preparation_time=item.preparation_time,
        restaurant_id=restaurant_id,  # Ovo se prenosi iz parametra funkcije
        menu_category_id=item.menu_category_id,
        category=item.category,
    )

    # Dodavanje i čuvanje novog item-a u bazu
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


async def update_item(db: Session, item_id: int, item: ItemUpdate):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in item.dict(exclude_unset=True).items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item


async def delete_item(db: Session, item_id: int):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}


async def add_image_to_item(db: Session, item_id: int, file: UploadFile):
    # Provera da li item postoji
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Čitanje sadržaja fajla
    file_data = await file.read()

    # Kreiranje nove slike i povezivanje sa stavkom (itemom)
    new_image = Image(image=file_data, item_id=item_id)

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    # Vraćamo samo osnovne informacije o slici, bez binarnih podataka
    return {"id": new_image.id, "item_id": new_image.item_id}
