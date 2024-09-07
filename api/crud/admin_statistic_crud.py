from sqlalchemy.orm import Session
from models.models import Order, OrderAssignment, OrderAssignmentStatus, Courier, Restaurant, OrderStatus, CourierStatus, OperatingHours, OrderQueue, OrderQueueStatusEnum
from sqlalchemy import func, and_
from datetime import datetime, timedelta

def a_get_pending_orders(db: Session):
    return db.query(func.count(Order.id)).filter(Order.status == OrderStatus.pending).scalar()

def a_get_preparing_orders(db: Session):
    return db.query(func.count(Order.id)).join(OrderQueue, Order.id == OrderQueue.order_id).filter(
        Order.status == OrderStatus.preparing,
        OrderQueue.status == OrderQueueStatusEnum.pending
    ).scalar()

def a_get_in_delivery_orders(db: Session):
    return db.query(func.count(Order.id)).join(OrderAssignment, Order.id == OrderAssignment.order_id).filter(
        OrderAssignment.status == OrderAssignmentStatus.in_delivery
    ).scalar()

def a_get_online_couriers(db: Session):
    return db.query(func.count(Courier.id)).filter(Courier.status == CourierStatus.online).scalar()

def a_get_busy_couriers(db: Session):
    return db.query(func.count(Courier.id)).filter(Courier.status == CourierStatus.busy).scalar()

def a_get_offline_couriers(db: Session):
    return db.query(func.count(Courier.id)).filter(Courier.status == CourierStatus.offline).scalar()

def a_get_open_restaurants(db: Session):
    now = datetime.now().time()
    today = datetime.now().strftime("%A")

    return db.query(func.count(Restaurant.id)).join(Restaurant.operating_hours).filter(
        and_(
            OperatingHours.day_of_week == today,
            OperatingHours.opening_time <= now,
            OperatingHours.closing_time > now,
            OperatingHours.closing_time > (datetime.now() + timedelta(hours=1)).time()
        )
    ).scalar()

def a_get_closing_soon_restaurants(db: Session):
    now = datetime.now().time()
    today = datetime.now().strftime("%A")

    return db.query(func.count(Restaurant.id)).join(Restaurant.operating_hours).filter(
        and_(
            OperatingHours.day_of_week == today,
            OperatingHours.closing_time <= (datetime.now() + timedelta(hours=1)).time(),
            OperatingHours.closing_time > now 
        )
    ).scalar()

def a_get_closed_restaurants(db: Session):
    now = datetime.now().time()
    today = datetime.now().strftime("%A")

    return db.query(func.count(Restaurant.id)).join(Restaurant.operating_hours).filter(
        and_(
            OperatingHours.day_of_week == today,
            OperatingHours.closing_time <= now
        )
    ).scalar()
