from sqlalchemy.orm import Session
from models.models import Order, Courier, Rating, Restaurant, OrderAssignment, OrderAssignmentStatus
from sqlalchemy import func
from decimal import Decimal

def get_courier_id(db: Session, user_id: int):
    courier = db.query(Courier.id).filter(Courier.user_id == user_id).first()
    return courier.id if courier else None

def c_get_active_orders(db: Session, user_id: int):
    courier_id = get_courier_id(db, user_id)
    if not courier_id:
        return 0
    
    return db.query(func.count(Order.id))\
        .select_from(OrderAssignment)\
        .join(Order, OrderAssignment.order_id == Order.id)\
        .filter(
            OrderAssignment.courier_id == courier_id,
            OrderAssignment.status == OrderAssignmentStatus.in_delivery
        ).scalar()

def c_get_restaurant_count(db: Session, user_id: int):
    courier_id = get_courier_id(db, user_id)
    if not courier_id:
        return 0
    
    return db.query(func.count(func.distinct(Courier.restaurant_id)))\
        .filter(Courier.user_id == user_id).scalar()

def c_get_completed_orders(db: Session, user_id: int):
    courier_id = get_courier_id(db, user_id)
    if not courier_id:
        return 0

    return db.query(func.count(Order.id))\
        .select_from(OrderAssignment)\
        .join(Order, OrderAssignment.order_id == Order.id)\
        .filter(
            OrderAssignment.courier_id == courier_id,
            OrderAssignment.status == OrderAssignmentStatus.delivered
        ).scalar()

def c_get_average_rating(db: Session, user_id: int):
    courier_id = get_courier_id(db, user_id)
    if not courier_id:
        return 0
    
    avg_rating = db.query(func.avg(Rating.courier_rating))\
        .join(OrderAssignment, Rating.order_id == OrderAssignment.order_id)\
        .join(Order, Order.id == OrderAssignment.order_id)\
        .filter(OrderAssignment.courier_id == courier_id)\
        .scalar()

    return float(avg_rating) if avg_rating is not None else 0
