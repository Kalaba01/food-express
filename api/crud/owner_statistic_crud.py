from sqlalchemy.orm import Session
from models.models import Order, OrderStatus, OrderQueue, OrderQueueStatusEnum, Courier, CourierStatus, Restaurant, Rating
from utils.rating_utils import calculate_average_rating
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
    restaurants = db.query(Restaurant).filter(Restaurant.owner_id == owner_id).all()

    if not restaurants:
        return 0

    total_average_sum = 0
    rated_restaurants = 0

    for restaurant in restaurants:
        if restaurant.rating_count > 0:
            restaurant_average_rating = calculate_average_rating(restaurant.total_rating, restaurant.rating_count)
            total_average_sum += restaurant_average_rating
            rated_restaurants += 1

    if rated_restaurants == 0:
        return 0 

    final_average_rating = calculate_average_rating(total_average_sum, rated_restaurants)

    return final_average_rating
