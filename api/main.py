import os
import asyncio
import uuid

from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from database.database import SessionLocal, engine, get_db
from models.models import Base, User, PasswordResetToken, Image, Request, DeliveryZone, Restaurant, MenuCategory, Item
from schemas.schemas import UserCreate, ForgotPasswordRequest, ImageCreate, RequestCreate, RequestStatusUpdate, UserUpdate, DeliveryZoneCreate, DeliveryZoneUpdate, RestaurantCreate, RestaurantUpdate, MenuCategoryCreate, MenuCategoryUpdate, ItemCreate, ItemUpdate

from auth.auth import create_access_token, get_current_user
from utils.password_utils import hash_password, verify_password, generate_temp_password
from utils.email_utils import send_email
from utils.email_templates_utils import welcome_email, reset_password_email, request_denied_email, request_reminder_email, account_creation_email
from utils.scheduled_tasks_utils import deny_requests_and_send_emails, remind_pending_requests

from crud.user_crud import create_user, get_user_by_username, get_user_by_email, create_password_reset_token, verify_password_reset_token, update_user_password, check_user_exists, create_user_from_request, delete_user
from crud.request_crud import create_request, get_all_requests, update_request_status
from crud.delivery_zone_crud import get_all_zones, create_zone, update_zone

def start_application():
    app = FastAPI()
    origins = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )
    return app

app = start_application()

Base.metadata.create_all(bind=engine)

# Dodavanje zadataka u APScheduler
scheduler = BackgroundScheduler()
scheduler.add_job(lambda: asyncio.run(deny_requests_and_send_emails()), CronTrigger(hour=0, minute=0))
scheduler.add_job(lambda: asyncio.run(remind_pending_requests()), CronTrigger(hour=0, minute=1))
scheduler.start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    await check_user_exists(db, user.username, user.email)
    
    new_user = await create_user(db, user, role='customer')
    
    subject = "Welcome to Food Express"
    body = welcome_email(new_user.username)
    await send_email(new_user.email, subject, body)
    
    return new_user

@app.post("/token")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = await get_user_by_username(db, form_data.username)
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    if not await verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    user_data = {
        "sub": db_user.username,
        "id": db_user.id,
        "email": db_user.email,
        "role": db_user.role
    }
    access_token = await create_access_token(data=user_data)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/check-username/{username}")
async def check_username(username: str, db: Session = Depends(get_db)):
    user = await get_user_by_username(db, username)
    return {"exists": bool(user)}

@app.get("/check-email/{email}")
async def check_email(email: str, db: Session = Depends(get_db)):
    user = await get_user_by_email(db, email)
    return {"exists": bool(user)}

@app.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = request.email
    user = await get_user_by_email(db, email)
    if not user:
        return {"message": "If the email exists, a reset link has been sent."}
    reset_token = await create_password_reset_token(db, user.id)

    reset_link = f"http://localhost:3000/reset-password?token={reset_token.token}"
    subject = "Reset Your Password - Food Express"
    body = reset_password_email(user.username, reset_link)
    await send_email(user.email, subject, body)
    
    return {"message": "If the email exists, a reset link has been sent."}

@app.post("/reset-password")
async def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    reset_token = await verify_password_reset_token(db, token)
    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if await verify_password(new_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="New password cannot be the same as the current password")

    await update_user_password(db, user.id, new_password)
    return {"message": "Password reset successful"}

@app.post("/upload-image/")
async def upload_image(item_id: int = None, restaurant_id: int = None, file: UploadFile = File(...), db: Session = Depends(get_db)):
    image_data = await file.read()
    new_image = Image(image=image_data, item_id=item_id, restaurant_id=restaurant_id)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return {"message": "Image uploaded successfully", "image_id": new_image.id}

@app.post("/requests/")
async def create_request_endpoint(request: RequestCreate, db: Session = Depends(get_db)):
    new_request = await create_request(db, request)
    return new_request

@app.get("/requests/")
async def read_requests(db: Session = Depends(get_db)):
    return await get_all_requests(db)

@app.put("/requests/{request_id}")
async def update_request_status_endpoint(request_id: int, status_update: RequestStatusUpdate, db: Session = Depends(get_db)):
    request = await update_request_status(db, request_id, status_update)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if status_update.status == 'accepted':
        try:
            new_user, reset_token = await create_user_from_request(db, request)
            reset_link = f"http://localhost:3000/reset-password?token={reset_token.token}"
            subject = "Welcome to Food Express - Set Your Password"
            body = account_creation_email(request.first_name, request.last_name, new_user.username, reset_link)
            await send_email(request.email, subject, body)
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return request

@app.get("/users/")
async def read_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.put("/users/{user_id}")
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.username:
        user.username = user_update.username
    if user_update.email:
        user.email = user_update.email
    if user_update.password:
        if await verify_password(user_update.password, user.hashed_password):
            raise HTTPException(status_code=400, detail="New password cannot be the same as the old password")
        user.hashed_password = await hash_password(user_update.password)
    if user_update.role:
        user.role = user_update.role
    
    db.commit()
    db.refresh(user)
    return user

@app.delete("/users/{user_id}")
async def user_delete(user_id: int, db: Session = Depends(get_db)):
    # Poziv funkcije za brisanje korisnika
    await delete_user(db, user_id)

    return {"message": "User deleted successfully"}

@app.get("/delivery-zones/")
async def read_delivery_zones(db: Session = Depends(get_db)):
    return await get_all_zones(db)

@app.post("/delivery-zones/")
async def create_delivery_zone(zone: DeliveryZoneCreate, db: Session = Depends(get_db)):
    return await create_zone(db, zone)

@app.put("/delivery-zones/{zone_id}")
async def update_delivery_zone(zone_id: int, zone: DeliveryZoneUpdate, db: Session = Depends(get_db)):
    updated_zone = await update_zone(db, zone_id, zone)
    if not updated_zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return updated_zone

@app.delete("/delivery-zones/{zone_id}")
async def delete_delivery_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(DeliveryZone).filter(DeliveryZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    db.delete(zone)
    db.commit()
    return {"message": "Zone deleted successfully"}

@app.get("/restaurants/")
async def read_restaurants(db: Session = Depends(get_db)):
    return db.query(Restaurant).all()

@app.post("/restaurants/")
async def create_restaurant(restaurant: RestaurantCreate, db: Session = Depends(get_db)):
    new_restaurant = Restaurant(**restaurant.dict())
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)
    return new_restaurant

@app.put("/restaurants/{restaurant_id}")
async def update_restaurant(restaurant_id: int, restaurant: RestaurantUpdate, db: Session = Depends(get_db)):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    for key, value in restaurant.dict(exclude_unset=True).items():
        setattr(db_restaurant, key, value)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

@app.delete("/restaurants/{restaurant_id}")
async def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    db.delete(db_restaurant)
    db.commit()
    return {"message": "Restaurant deleted successfully"}

# Rute za MenuCategory
@app.get("/menu-categories/")
async def read_menu_categories(restaurant_id: int, db: Session = Depends(get_db)):
    return db.query(MenuCategory).filter(MenuCategory.restaurant_id == restaurant_id).all()

@app.post("/menu-categories/")
async def create_menu_category(menu_category: MenuCategoryCreate, db: Session = Depends(get_db)):
    new_category = MenuCategory(**menu_category.dict())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@app.put("/menu-categories/{category_id}")
async def update_menu_category(category_id: int, menu_category: MenuCategoryUpdate, db: Session = Depends(get_db)):
    db_category = db.query(MenuCategory).filter(MenuCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Menu category not found")
    for key, value in menu_category.dict(exclude_unset=True).items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.delete("/menu-categories/{category_id}")
async def delete_menu_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(MenuCategory).filter(MenuCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Menu category not found")
    db.delete(db_category)
    db.commit()
    return {"message": "Menu category deleted successfully"}

# Rute za Item
@app.get("/items/")
async def read_items(category_id: int, db: Session = Depends(get_db)):
    return db.query(Item).filter(Item.menu_category_id == category_id).all()

@app.post("/items/")
async def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    new_item = Item(**item.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.put("/items/{item_id}")
async def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in item.dict(exclude_unset=True).items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/items/{item_id}")
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}

