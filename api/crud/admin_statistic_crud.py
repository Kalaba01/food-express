from sqlalchemy.orm import Session
from models.models import Order, OrderAssignment, OrderAssignmentStatus, Courier, Restaurant, OrderStatus, CourierStatus, OperatingHours, OrderQueue, OrderQueueStatusEnum
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta

# Retrieves the count of pending orders from the database
def a_get_pending_orders(db: Session):
    return db.query(func.count(Order.id)).filter(Order.status == OrderStatus.pending).scalar()

# Retrieves the count of orders in preparing status and pending queue
def a_get_preparing_orders(db: Session):
    return db.query(func.count(Order.id)).join(OrderQueue, Order.id == OrderQueue.order_id).filter(
        Order.status == OrderStatus.preparing,
        OrderQueue.status == OrderQueueStatusEnum.pending
    ).scalar()

# Retrieves the count of orders that are currently in delivery
def a_get_in_delivery_orders(db: Session):
    return db.query(func.count(Order.id)).join(OrderAssignment, Order.id == OrderAssignment.order_id).filter(
        OrderAssignment.status == OrderAssignmentStatus.in_delivery
    ).scalar()

# Retrieves the count of couriers that are currently online
def a_get_online_couriers(db: Session):
    return db.query(func.count(Courier.id)).filter(Courier.status == CourierStatus.online).scalar()

# Retrieves the count of couriers that are currently busy
def a_get_busy_couriers(db: Session):
    return db.query(func.count(Courier.id)).filter(Courier.status == CourierStatus.busy).scalar()

# Retrieves the count of couriers that are currently offline
def a_get_offline_couriers(db: Session):
    return db.query(func.count(Courier.id)).filter(Courier.status == CourierStatus.offline).scalar()

# Retrieves the count of restaurants that are currently open based on their operating hours
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

# Retrieves the count of restaurants that are closing soon (within one hour)
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

# Retrieves the count of restaurants that are currently closed
def a_get_closed_restaurants(db: Session):
    now = datetime.now().time()
    today = datetime.now().strftime("%A")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%A")

    closed_restaurants = db.query(func.count(Restaurant.id)).join(Restaurant.operating_hours).filter(
        or_(
            and_(
                OperatingHours.day_of_week == today,
                OperatingHours.opening_time > now
            ),
            and_(
                OperatingHours.day_of_week == today,
                OperatingHours.closing_time <= now
            ),
            and_(
                OperatingHours.day_of_week == tomorrow,
                OperatingHours.closing_time <= now
            )
        )
    ).scalar()

    return closed_restaurants
