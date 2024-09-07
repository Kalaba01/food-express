from sqlalchemy.orm import Session
from models.models import Order, OrderStatus, OrderQueue, OrderQueueStatusEnum, Courier, CourierStatus, Restaurant, Rating
from sqlalchemy import func
from decimal import Decimal

def o_get_pending_orders_owner(db: Session, owner_id: int):
    return db.query(func.count(Order.id))\
             .join(Restaurant, Restaurant.id == Order.restaurant_id)\
             .filter(Order.status == OrderStatus.pending, Restaurant.owner_id == owner_id)\
             .scalar()

def o_get_preparing_orders_owner(db: Session, owner_id: int):
    return db.query(func.count(Order.id))\
             .join(OrderQueue, Order.id == OrderQueue.order_id)\
             .join(Restaurant, Restaurant.id == Order.restaurant_id)\
             .filter(Order.status == OrderStatus.preparing, 
                     OrderQueue.status == OrderQueueStatusEnum.pending,
                     Restaurant.owner_id == owner_id)\
             .scalar()

def o_get_online_couriers_owner(db: Session, owner_id: int):
    return db.query(func.count(Courier.id))\
             .join(Restaurant, Restaurant.id == Courier.restaurant_id)\
             .filter(Courier.status == CourierStatus.online, Restaurant.owner_id == owner_id)\
             .scalar()

def o_get_busy_couriers_owner(db: Session, owner_id: int):
    return db.query(func.count(Courier.id))\
             .join(Restaurant, Restaurant.id == Courier.restaurant_id)\
             .filter(Courier.status == CourierStatus.busy, Restaurant.owner_id == owner_id)\
             .scalar()

def o_get_offline_couriers_owner(db: Session, owner_id: int):
    return db.query(func.count(Courier.id))\
             .join(Restaurant, Restaurant.id == Courier.restaurant_id)\
             .filter(Courier.status == CourierStatus.offline, Restaurant.owner_id == owner_id)\
             .scalar()

def o_get_earnings_owner(db: Session, owner_id: int):
    earnings = db.query(func.sum(Order.total_price))\
                 .join(Restaurant, Restaurant.id == Order.restaurant_id)\
                 .filter(Restaurant.owner_id == owner_id)\
                 .scalar()
    return float(earnings) if isinstance(earnings, Decimal) else earnings

def o_get_ratings_owner(db: Session, owner_id: int):
    ratings = db.query(func.avg(Rating.restaurant_rating))\
                .join(Restaurant, Restaurant.id == Rating.restaurant_id)\
                .filter(Restaurant.owner_id == owner_id)\
                .scalar()
    return float(ratings) if isinstance(ratings, Decimal) else ratings
