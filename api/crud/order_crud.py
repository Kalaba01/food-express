from sqlalchemy.orm import Session
from fastapi import HTTPException
from geopy.geocoders import Nominatim
from models.models import Order, OrderItem, Bank
from schemas.schemas import OrderCreate, OrderStatusEnum
from utils.delivery_utils import is_in_delivery_zone
from utils.card_utils import validate_card_payment

async def create_order(db: Session, order: OrderCreate):
    geolocator = Nominatim(user_agent="food-express")
    location = geolocator.geocode(order.delivery_address, country_codes="BA")
    if not location:
        raise HTTPException(status_code=400, detail="Address could not be located.")
    
    longitude = location.longitude
    latitude = location.latitude

    if not is_in_delivery_zone(db, order.restaurant_id, latitude, longitude):
        raise HTTPException(status_code=400, detail="We do not deliver to this address.")
    
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

    return new_order
