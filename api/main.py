import os
import asyncio
import uuid
import json

from datetime import datetime, timedelta
from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    File,
    UploadFile,
    Form,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.websockets import WebSocket
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from database.database import SessionLocal, engine, get_db
from models.models import (
    Base,
    User,
    PasswordResetToken,
    Image,
    Request,
    DeliveryZone,
    Restaurant,
    MenuCategory,
    Item,
    Chat,
    Conversation,
)
from schemas.schemas import (
    UserCreate,
    ForgotPasswordRequest,
    ImageCreate,
    RequestCreate,
    RequestStatusUpdate,
    UserUpdate,
    DeliveryZoneCreate,
    DeliveryZoneUpdate,
    RestaurantCreate,
    RestaurantUpdate,
    MenuCategoryCreate,
    MenuCategoryUpdate,
    ItemCreate,
    ItemUpdate,
    OrderCreate,
    OrderUpdate,
    ImageCreate,
    ImageUpdate,
    CourierCreate,
    CourierUpdate,
    PasswordChangeRequest,
    SearchQuery,
    StatusUpdateRequest,
    UpdateOrderStatusSchema,
    RatingCreate,
)

from auth.auth import create_access_token, get_current_user
from utils.password_utils import hash_password, verify_password, generate_temp_password
from utils.email_utils import send_email
from utils.email_templates_utils import (
    welcome_email,
    reset_password_email,
    request_denied_email,
    request_reminder_email,
)
from utils.scheduled_tasks_utils import (
    deny_requests_and_send_emails,
    remind_pending_requests,
)

from crud.user_crud import (
    create_user,
    get_user_by_username,
    get_user_by_email,
    create_password_reset_token,
    verify_password_reset_token,
    update_user_password,
    check_user_exists,
    create_user_from_request,
    delete_user,
    update_user_details,
    get_profile,
    update_user_profile,
    change_user_password,
)
from crud.request_crud import (
    create_request,
    get_all_requests,
    update_request_status,
    check_pending_request_by_email,
    update_request_status_and_process,
)
from crud.delivery_zone_crud import (
    get_all_zones,
    create_zone,
    update_zone,
    delete_delivery_zone_by_id,
)
from crud.restaurant_crud import (
    get_all_restaurants,
    create_new_restaurant,
    update_existing_restaurant,
    delete_restaurant_and_related_data,
    search_owners,
    get_restaurant_by_id,
    create_category,
    update_category,
    create_item,
    update_item,
    get_categories,
)
from crud.menu_crud import (
    get_menu_categories,
    create_menu_category,
    update_menu_category,
    delete_menu_category,
)
from crud.item_crud import (
    get_items,
    create_item,
    update_item,
    delete_item,
    add_image_to_item,
)
from crud.orders_crud import (
    get_all_orders,
    get_order_by_id,
    new_order_create,
    update_order,
    delete_order,
)
from crud.couriers_crud import (
    get_all_couriers,
    create_courier,
    update_courier,
    delete_courier,
    search_restaurants,
    search_couriers,
)
from crud.chat_crud import (
    create_conversation,
    get_conversation,
    create_message,
    get_conversation_messages,
    get_last_message,
    get_user_chat_history,
    get_users_sorted_by_role,
    handle_send_message,
)
from crud.customer_crud import (
    search_restaurants,
    search_items,
    get_restaurant_details,
    get_restaurant_menu,
)
from crud.order_crud import create_order
from crud.status_crud import get_courier_status, update_courier_status
from crud.pending_crud import get_pending_orders_for_owner, update_order_status
from crud.system import assign_orders_to_couriers
from crud.track_orders_crud import get_customer_orders
from crud.rating_crud import submit_rating
from crud.order_history import get_customer_order_history_with_items
from crud.deliver_order_crud import get_orders_for_courier, finish_order
from crud.courier_crud import has_unfinished_orders
from crud.delivered_orders_crud import get_delivered_orders
from crud.admin_statistic_crud import (
    a_get_pending_orders,
    a_get_preparing_orders,
    a_get_in_delivery_orders,
    a_get_online_couriers,
    a_get_busy_couriers,
    a_get_offline_couriers,
    a_get_open_restaurants,
    a_get_closing_soon_restaurants,
    a_get_closed_restaurants,
)
from crud.owner_statistic_crud import (
    o_get_pending_orders_owner,
    o_get_preparing_orders_owner,
    o_get_online_couriers_owner,
    o_get_busy_couriers_owner,
    o_get_offline_couriers_owner,
    o_get_earnings_owner,
    o_get_ratings_owner,
)
from crud.courier_statistic_crud import (
    c_get_active_orders,
    c_get_restaurant_count,
    c_get_completed_orders,
    c_get_average_rating,
)
from crud.top_restaurants_crud import get_top_restaurants
from crud.notifications_crud import (
    get_notifications,
    mark_as_read
)


async def schedule_assign_orders_to_couriers():
    print("Function for assigning orders to couriers start!")
    db: Session = next(get_db())
    await assign_orders_to_couriers(db)


def start_application():
    app = FastAPI()
    origins = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app


app = start_application()

Base.metadata.create_all(bind=engine)

# Dodavanje zadataka u APScheduler
scheduler = BackgroundScheduler()
scheduler.add_job(
    lambda: asyncio.run(deny_requests_and_send_emails()), CronTrigger(hour=0, minute=0)
)
scheduler.add_job(
    lambda: asyncio.run(remind_pending_requests()), CronTrigger(hour=0, minute=1)
)
scheduler.add_job(
    lambda: asyncio.run(schedule_assign_orders_to_couriers()), 'interval', seconds=15
)
scheduler.start()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

connections = {}


@app.websocket("/ws/chat/{conversation_id}")
async def websocket_endpoint(websocket: WebSocket, conversation_id: int):
    await websocket.accept()
    print(f"New WebSocket connection: {conversation_id}")

    if conversation_id not in connections:
        connections[conversation_id] = []
    connections[conversation_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received message: {data}")

            # Parsiraj JSON podatke
            parsed_data = json.loads(data)

            # Emitovanje poruke svim povezanim klijentima za tu konverzaciju
            for connection in connections[conversation_id]:
                await connection.send_text(json.dumps(parsed_data))

    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {conversation_id}")
        connections[conversation_id].remove(websocket)
        if len(connections[conversation_id]) == 0:
            del connections[conversation_id]


@app.websocket("/ws/admin-stats")
async def websocket_stats(websocket: WebSocket):
    await websocket.accept()
    db = SessionLocal()
    try:
        while True:
            stats_data = {
                "pendingOrders": a_get_pending_orders(db),
                "preparingOrders": a_get_preparing_orders(db),
                "inDeliveryOrders": a_get_in_delivery_orders(db),
                "onlineCouriers": a_get_online_couriers(db),
                "busyCouriers": a_get_busy_couriers(db),
                "offlineCouriers": a_get_offline_couriers(db),
                "openRestaurants": a_get_open_restaurants(db),
                "closingSoonRestaurants": a_get_closing_soon_restaurants(db),
                "closedRestaurants": a_get_closed_restaurants(db),
            }
            try:
                await websocket.send_json(stats_data)
            except WebSocketDisconnect:
                print("WebSocket disconnected")
                break
            await asyncio.sleep(5)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()


@app.websocket("/ws/owner-stats/{owner_id}")
async def websocket_owner_stats(websocket: WebSocket, owner_id: int):
    db = SessionLocal()
    await websocket.accept()
    try:
        while True:
            stats_data = {
                "pendingOrders": o_get_pending_orders_owner(db, owner_id),
                "preparingOrders": o_get_preparing_orders_owner(db, owner_id),
                "onlineCouriers": o_get_online_couriers_owner(db, owner_id),
                "busyCouriers": o_get_busy_couriers_owner(db, owner_id),
                "offlineCouriers": o_get_offline_couriers_owner(db, owner_id),
                "earnings": o_get_earnings_owner(db, owner_id),
                "ratings": o_get_ratings_owner(db, owner_id),
            }
            try:
                await websocket.send_json(stats_data)
            except WebSocketDisconnect:
                print("WebSocket disconnected")
                break
            await asyncio.sleep(5)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()


@app.websocket("/ws/courier-stats/{user_id}")
async def websocket_courier_stats(websocket: WebSocket, user_id: int):
    await websocket.accept()
    db = SessionLocal()
    try:
        while True:
            stats_data = {
                "activeOrders": c_get_active_orders(db, user_id),
                "restaurantCount": c_get_restaurant_count(db, user_id),
                "completedOrders": c_get_completed_orders(db, user_id),
                "averageRating": c_get_average_rating(db, user_id),
            }
            try:
                await websocket.send_json(stats_data)
            except WebSocketDisconnect:
                print("WebSocket disconnected")
                break
            await asyncio.sleep(5)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()


@app.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: int):
    await websocket.accept()
    db = SessionLocal()
    try:
        while True:
            notifications_data = {
                "notifications": [
                    {
                        "id": notification.id,
                        "message": notification.message,
                        "read": notification.read,
                        "created_at": (
                            notification.created_at.isoformat()
                            if notification.created_at
                            else None
                        ),
                    }
                    for notification in get_notifications(db, user_id)
                ]
            }

            try:
                await websocket.send_json(notifications_data)
            except WebSocketDisconnect:
                print(f"WebSocket disconnected for user {user_id}")
                break

            await asyncio.sleep(5)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

@app.post("/upload-image/")
async def upload_image(
    item_id: int = None,
    restaurant_id: int = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image_data = await file.read()
    new_image = Image(image=image_data, item_id=item_id, restaurant_id=restaurant_id)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return {"message": "Image uploaded successfully", "image_id": new_image.id}


# Registracija
@app.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    await check_user_exists(db, user.username, user.email)

    new_user = await create_user(db, user, role="customer")

    subject = "Welcome to Food Express"
    body = welcome_email(new_user.username)
    await send_email(new_user.email, subject, body)

    return new_user


# Autentifikacija
@app.post("/token")
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    db_user = await get_user_by_username(db, form_data.username)
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    if not await verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    user_data = {
        "sub": db_user.username,
        "id": db_user.id,
        "email": db_user.email,
        "role": db_user.role,
    }
    access_token = create_access_token(data=user_data)
    return {"access_token": access_token, "token_type": "bearer"}


# Provjera usernama
@app.get("/check-username/{username}")
async def check_username(username: str, db: Session = Depends(get_db)):
    user = await get_user_by_username(db, username)
    return {"exists": bool(user)}


# Provjera e-maila
@app.get("/check-email/{email}")
async def check_email(email: str, db: Session = Depends(get_db)):
    user = await get_user_by_email(db, email)
    return {"exists": bool(user)}


# Forgot Password
@app.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest, db: Session = Depends(get_db)
):
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


# Reset Password
@app.post("/reset-password")
async def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    reset_token = await verify_password_reset_token(db, token)
    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if await verify_password(new_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="New password cannot be the same as the current password",
        )

    await update_user_password(db, user.id, new_password)
    return {"message": "Password reset successful"}


# Svi korisnici
@app.get("/users/")
async def read_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users


# Korisnik na osnovu ID-a
@app.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Azuriranje korisnika
@app.put("/users/{user_id}")
async def update_user(
    user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)
):
    return await update_user_details(user_id, user_update, db)


# Brisanje korisnika
@app.delete("/users/{user_id}")
async def user_delete(user_id: int, db: Session = Depends(get_db)):
    await delete_user(db, user_id)
    return {"message": "User deleted successfully"}


# Svi restorani
@app.get("/restaurants/")
async def read_restaurants(db: Session = Depends(get_db)):
    return await get_all_restaurants(db)


# Restoran na osnovu ID-a
@app.get("/restaurants/{restaurant_id}")
async def read_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = await get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


# Kreiranje restorana
@app.post("/restaurants/")
async def create_restaurant(
    restaurant: RestaurantCreate, db: Session = Depends(get_db)
):
    return await create_new_restaurant(db, restaurant)


# Azuriranje restorana
@app.put("/restaurants/{restaurant_id}")
async def update_restaurant(
    restaurant_id: int, restaurant: RestaurantUpdate, db: Session = Depends(get_db)
):
    return await update_existing_restaurant(db, restaurant_id, restaurant)


# Brisanje restorana
@app.delete("/restaurants/{restaurant_id}")
async def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    return await delete_restaurant_and_related_data(db, restaurant_id)


# Rute za MenuCategory
@app.get("/menu-categories/")
async def read_menu_categories(restaurant_id: int, db: Session = Depends(get_db)):
    return await get_menu_categories(db, restaurant_id)


@app.post("/menu-categories/")
async def create_menu_category(
    menu_category: MenuCategoryCreate, db: Session = Depends(get_db)
):
    return await create_menu_category(db, menu_category)


@app.put("/menu-categories/{category_id}")
async def update_menu_category(
    category_id: int, menu_category: MenuCategoryUpdate, db: Session = Depends(get_db)
):
    return await update_menu_category(db, category_id, menu_category)


@app.delete("/menu-categories/{category_id}")
async def delete_menu_category(category_id: int, db: Session = Depends(get_db)):
    return await delete_menu_category(db, category_id)


# Rute za Item
@app.get("/items/")
async def read_items(category_id: int, db: Session = Depends(get_db)):
    return await get_items(db, category_id)


# Restorani odredjenog vlasnika
@app.get("/owner/restaurants")
async def get_owner_restaurants(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Not authorized")
    restaurants = (
        db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).all()
    )
    return restaurants


# Kategorije restorana
@app.get("/restaurants/{restaurant_id}/categories")
async def get_restaurant_categories(restaurant_id: int, db: Session = Depends(get_db)):
    categories = await get_categories(db, restaurant_id)
    return categories


# Dodavanje kategorija za restoran
@app.post("/restaurants/{restaurant_id}/categories")
async def add_category(
    restaurant_id: int, category: MenuCategoryCreate, db: Session = Depends(get_db)
):
    new_category = await create_category(db, restaurant_id, category)
    return new_category


# Azuriranje kategorije restorana
@app.put("/restaurants/{restaurant_id}/categories/{category_id}")
async def edit_category(
    restaurant_id: int,
    category_id: int,
    category: MenuCategoryUpdate,
    db: Session = Depends(get_db),
):
    updated_category = await update_category(db, restaurant_id, category_id, category)
    return updated_category


# Brisanje kategorije restorana
@app.delete("/restaurants/{restaurant_id}/categories/{category_id}")
async def delete_category(
    restaurant_id: int, category_id: int, db: Session = Depends(get_db)
):
    category = (
        db.query(MenuCategory)
        .filter_by(id=category_id, restaurant_id=restaurant_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}


# Artikli restorana
@app.get("/restaurants/{restaurant_id}/items")
async def get_restaurant_items(restaurant_id: int, db: Session = Depends(get_db)):
    items = await get_items(db, restaurant_id)
    return items


# Dodavanje artikala za restoran
@app.post("/restaurants/{restaurant_id}/items")
async def add_item(restaurant_id: int, item: ItemCreate, db: Session = Depends(get_db)):
    new_item = await create_item(db, restaurant_id, item)
    return new_item


# Azuriranje artikala za restoran
@app.put("/restaurants/{restaurant_id}/items/{item_id}")
async def edit_item(
    restaurant_id: int, item_id: int, item: ItemUpdate, db: Session = Depends(get_db)
):
    updated_item = await update_item(db, item_id, item)
    return updated_item


# Brisanje artikala za restoran
@app.delete("/restaurants/{restaurant_id}/items/{item_id}")
async def delete_item(restaurant_id: int, item_id: int, db: Session = Depends(get_db)):
    item = (
        db.query(Item)
        .filter(Item.id == item_id, Item.restaurant_id == restaurant_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted successfully"}


# Dodavanje slika za restoran
@app.post("/restaurants/{restaurant_id}/images")
async def upload_image(
    restaurant_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    content = await file.read()
    new_image = Image(image=content, restaurant_id=restaurant_id)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return {"image": new_image.id}


# Brisanje slike za restoran
@app.delete("/restaurants/{restaurant_id}/images/{image_id}")
async def delete_image(
    restaurant_id: int, image_id: int, db: Session = Depends(get_db)
):
    image = (
        db.query(Image)
        .filter(Image.id == image_id, Image.restaurant_id == restaurant_id)
        .first()
    )
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    db.delete(image)
    db.commit()
    return {"message": "Image deleted successfully"}


# Dodavnje slike za artikal
@app.post("/items/{item_id}/images")
async def upload_item_image(
    item_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)
):
    try:
        image = await add_image_to_item(db, item_id, file)
        return image
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Brisanje slike za artikal
@app.delete("/items/{item_id}/images/{image_id}")
async def delete_item_image(item_id: int, image_id: int, db: Session = Depends(get_db)):
    image = (
        db.query(Image).filter(Image.id == image_id, Image.item_id == item_id).first()
    )
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    db.delete(image)
    db.commit()
    return {"detail": "Image deleted successfully"}


# Svi zahtjevi
@app.get("/requests/")
async def read_requests(db: Session = Depends(get_db)):
    return await get_all_requests(db)


# Dodavanje zahtjeva
@app.post("/requests/")
async def create_request_endpoint(
    request: RequestCreate, db: Session = Depends(get_db)
):
    existing_request = await check_pending_request_by_email(db, request.email)
    if existing_request:
        raise HTTPException(
            status_code=400, detail="Pending request with this email already exists."
        )
    new_request = await create_request(db, request)
    return new_request


# Azuriranje zahtjeva
@app.put("/requests/{request_id}")
async def update_request_status_endpoint(
    request_id: int, status_update: RequestStatusUpdate, db: Session = Depends(get_db)
):
    return await update_request_status_and_process(request_id, status_update, db)


# Sve zone dostave
@app.get("/delivery-zones/")
async def read_delivery_zones(db: Session = Depends(get_db)):
    return await get_all_zones(db)


# Dodavanje zone dostave
@app.post("/delivery-zones/")
async def create_delivery_zone(zone: DeliveryZoneCreate, db: Session = Depends(get_db)):
    return await create_zone(db, zone)


# Azuriranje zone dostave
@app.put("/delivery-zones/{zone_id}")
async def update_delivery_zone(
    zone_id: int, zone: DeliveryZoneUpdate, db: Session = Depends(get_db)
):
    updated_zone = await update_zone(db, zone_id, zone)
    if not updated_zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return updated_zone


# Brisanje zone dostave
@app.delete("/delivery-zones/{zone_id}")
async def delete_delivery_zone(zone_id: int, db: Session = Depends(get_db)):
    return await delete_delivery_zone_by_id(db, zone_id)


# Ruta za dohvatanje svih narudžbi
@app.get("/orders/")
async def read_orders(db: Session = Depends(get_db)):
    return await get_all_orders(db)


# Ruta za dohvatanje detalja pojedinačne narudžbe
@app.get("/orders/{order_id}")
async def read_order(order_id: int, db: Session = Depends(get_db)):
    order = await get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# Ruta za kreiranje nove narudžbe
@app.post("/orders/")
async def order_create_route(order: OrderCreate, db: Session = Depends(get_db)):
    return await new_order_create(db, order)


# Ruta za ažuriranje narudžbe
@app.put("/orders/{order_id}")
async def order_update(
    order_id: int, order: OrderUpdate, db: Session = Depends(get_db)
):
    updated_order = await update_order(db, order_id, order)
    if not updated_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated_order


# Ruta za brisanje narudžbe
@app.delete("/orders/{order_id}")
async def delete_order(order_id: int, db: Session = Depends(get_db)):
    return await delete_order(db, order_id)


# Pretraga vlasnika
@app.get("/search-owners/")
async def owners_search(username: str, db: Session = Depends(get_db)):
    return await search_owners(db, username)


# Ruta za dohvatanje svih kurira
@app.get("/couriers/")
async def read_couriers(db: Session = Depends(get_db)):
    return await get_all_couriers(db)


# Ruta za kreiranje novog kurira
@app.post("/couriers/")
async def create_new_courier(courier: CourierCreate, db: Session = Depends(get_db)):
    return await create_courier(db, courier)


# Ruta za ažuriranje postojećeg kurira
@app.put("/couriers/{courier_id}")
async def update_existing_courier(
    courier_id: int, courier: CourierUpdate, db: Session = Depends(get_db)
):
    return await update_courier(db, courier_id, courier)


# Ruta za brisanje kurira
@app.delete("/couriers/{courier_id}")
async def delete_existing_courier(courier_id: int, db: Session = Depends(get_db)):
    return await delete_courier(db, courier_id)


@app.get("/search-couriers/")
async def couriers_search(username: str, db: Session = Depends(get_db)):
    return await search_couriers(db, username)


@app.get("/search-restaurants/")
async def restaurants_search(name: str, db: Session = Depends(get_db)):
    return await search_restaurants(db, name)


@app.get("/profile")
async def profile_get(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    user_profile = await get_profile(db, user_id=current_user.id)
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user_profile


@app.put("/profile")
async def update_profile(
    username: str = Form(...),
    email: str = Form(...),
    profilePicture: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await update_user_profile(
        db, current_user.id, username, email, profilePicture
    )


@app.put("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = await change_user_password(
        db, current_user.id, password_data.oldPassword, password_data.newPassword
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Old password is incorrect"
        )
    return {"message": "Password changed successfully"}


@app.get("/api/chat/history/{user_id}")
async def get_user_chat_history_route(user_id: int, db: Session = Depends(get_db)):
    return await get_user_chat_history(db, user_id)


@app.get("/api/chat/users")
async def get_users_by_role(
    role: str, current_user_id: int, db: Session = Depends(get_db)
):
    return await get_users_sorted_by_role(db, role, current_user_id)


@app.post("/conversations/start/{user1_id}/{user2_id}")
async def start_conversation(
    user1_id: int, user2_id: int, db: Session = Depends(get_db)
):
    conversation = await get_conversation(db, user1_id, user2_id)
    if not conversation:
        conversation = await create_conversation(db, user1_id, user2_id)
    return conversation


@app.get("/conversations/{conversation_id}/messages/")
async def read_messages(conversation_id: int, db: Session = Depends(get_db)):
    return await get_conversation_messages(db, conversation_id)


@app.post("/conversations/{conversation_id}/messages/")
async def send_message(
    conversation_id: int,
    sender_id: int,
    receiver_id: int,
    message: str,
    db: Session = Depends(get_db),
):
    return await handle_send_message(
        db, conversation_id, sender_id, receiver_id, message, connections
    )


@app.get("/conversations/{conversation_id}/last-message/")
async def get_last_conversation_message(
    conversation_id: int, db: Session = Depends(get_db)
):
    return await get_last_message(db, conversation_id)


@app.get("/api/search/restaurants")
async def search_restaurants_route(
    query: SearchQuery = Depends(), db: Session = Depends(get_db)
):
    return await search_restaurants(db, query.query)


@app.get("/api/search/items")
async def search_items_route(
    query: SearchQuery = Depends(), db: Session = Depends(get_db)
):
    return await search_items(db, query.query)


@app.get("/api/restaurants/{restaurant_name}/details")
async def get_restaurant_details_route(
    restaurant_name: str, db: Session = Depends(get_db)
):
    return await get_restaurant_details(db, restaurant_name)


@app.get("/api/restaurants/{restaurant_name}/menu")
async def get_restaurant_menu_route(
    restaurant_name: str, db: Session = Depends(get_db)
):
    return await get_restaurant_menu(db, restaurant_name)


@app.post("/order/")
async def create_order_route(order: OrderCreate, db: Session = Depends(get_db)):
    return await create_order(db, order)


@app.get("/courier/status/{id}")
async def get_status(id: int, db: Session = Depends(get_db)):
    return await get_courier_status(db, id)


@app.put("/courier/status")
async def update_status(request: StatusUpdateRequest, db: Session = Depends(get_db)):
    return await update_courier_status(db, request.id, request.status)


@app.get("/owner/orders")
async def get_pending_orders(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    owner_id = current_user.id
    return await get_pending_orders_for_owner(db, owner_id)


@app.put("/owner/orders/{order_id}/update")
async def update_order_status_route(
    order_id: int, status: str, db: Session = Depends(get_db)
):
    return await update_order_status(db, order_id, status)


# Ruta za praćenje narudžbi
@app.get("/customer/track-orders")
async def track_orders(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return await get_customer_orders(current_user.id, db)


# Ruta za ocjenjivanje narudzbe od strane kupca
@app.post("/rating/submit")
async def rate_order(rating_data: RatingCreate, db: Session = Depends(get_db)):
    return await submit_rating(rating_data, db)


# Ruta za vracanje istorije narudzbi zajedno sa itemima
@app.get("/order-history/")
async def order_history(customer_id: int, db: Session = Depends(get_db)):
    orders = await get_customer_order_history_with_items(db, customer_id)
    return orders


# Ruta za prikaz narudzbi koje kurir treba da dostavi
@app.get("/courier/deliver-order/")
async def get_courier_orders(user_id: int, db: Session = Depends(get_db)):
    print(user_id)
    return await get_orders_for_courier(db, user_id)


# Ruta za zavrsavanje narudzbe od strane kurira
@app.post("/courier/finish-order/{order_id}")
async def order_finish(order_id: int, db: Session = Depends(get_db)):
    return await finish_order(db, order_id)


# Ruta za provjeru da li kurir moze da se izloguje
@app.get("/courier/{courier_id}/has-unfinished-orders")
async def check_pending_orders(courier_id: int, db: Session = Depends(get_db)):
    if await has_unfinished_orders(db, courier_id):
        return {"has_unfinished_orders": True}
    return {"has_unfinished_orders": False}


# Ruta za dohvacanje svih zavrsenih narudzbi za kurira
@app.get("/delivered-orders")
async def delivered_orders(
    user_id: int = Depends(get_current_user), db: Session = Depends(get_db)
):
    orders = await get_delivered_orders(db, user_id.id)
    return orders


# Ruta za fetchanje top restorana
@app.get("/api/top-restaurants")
async def top_restaurants(db: Session = Depends(get_db)):
    return await get_top_restaurants(db)

# Ruta za označavanje notifikacije kao pročitane
@app.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db)):
    return await mark_as_read(db, notification_id)
