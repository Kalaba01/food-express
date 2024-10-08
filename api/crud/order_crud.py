import pytz
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from geopy.geocoders import Nominatim
from models.models import Order, OrderItem, Bank, Notification, User, Restaurant
from schemas.schemas import OrderCreate, OrderStatusEnum
from utils.delivery_utils import is_in_delivery_zone
from utils.card_utils import validate_card_payment

# Creates a new order and handles address validation, delivery zone check, and payment validation
async def create_order(db: Session, order: OrderCreate):
    geolocator = Nominatim(user_agent="food-express")
    location = geolocator.geocode(order.delivery_address, country_codes="BA") # Geolocates the delivery address using Nominatim
    if not location:
        raise HTTPException(status_code=400, detail="Address could not be located.")
    
    longitude = location.longitude
    latitude = location.latitude

    # Checks if the delivery address is within the restaurant's delivery zone
    if not is_in_delivery_zone(db, order.restaurant_id, latitude, longitude):
        raise HTTPException(status_code=400, detail="We do not deliver to this address.")
    
    # Validates card payment if the payment method is card
    if order.payment_method == 'card':
        if not validate_card_payment(db, order.card_number, order.total_price):
            raise HTTPException(status_code=400, detail="Insufficient funds on the card.")
        order_money = order.card_number

    elif order.payment_method == 'cash':
        order_money = order.money
    
    new_order = Order(
        customer_id=order.customer_id,
        restaurant_id=order.restaurant_id,
        total_price=order.total_price,
        status=OrderStatusEnum.pending,
        delivery_address=order.delivery_address,
        delivery_latitude=latitude,
        delivery_longitude=longitude,
        cutlery_included=order.cutlery_included,
        contact=order.contact,
        payment_method=order.payment_method,
        money=order_money
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in order.items:
        order_item = OrderItem(
            order_id=new_order.id,
            item_id=item.item_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(order_item)

    db.commit()

    restaurant_owner = db.query(User).join(Restaurant).filter(Restaurant.id == order.restaurant_id).first()

    local_timezone = pytz.timezone("Europe/Sarajevo")
    local_now = datetime.now(local_timezone)

    if restaurant_owner:
        new_notification = Notification(
            user_id=restaurant_owner.id,
            message=f"New order has been placed for your restaurant {restaurant_owner.owned_restaurants[0].name}. Please confirm it.",
            read=False,
            created_at=local_now.replace(tzinfo=None)
        )
        db.add(new_notification)
        db.commit()

    return new_order
