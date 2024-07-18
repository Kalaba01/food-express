from sqlalchemy.orm import Session
from models.models import OrderQueue, Order, Courier, OrderAssignment, Bank
import datetime

def add_order_to_queue(order_id: int, db: Session):
    order_queue = OrderQueue(order_id=order_id, status='waiting')
    db.add(order_queue)
    db.commit()
    db.refresh(order_queue)
    return order_queue

def assign_orders_in_queue(db: Session):
    waiting_orders = db.query(OrderQueue).filter(OrderQueue.status == 'waiting').all()
    for order_queue in waiting_orders:
        order = db.query(Order).filter(Order.id == order_queue.order_id).first()
        if order:
            assigned = assign_order_to_courier(order, db)
            if assigned:
                order_queue.status = 'assigned'
                db.commit()
                db.refresh(order_queue)

def assign_order_to_courier(order: Order, db: Session):
    couriers = db.query(Courier).filter(Courier.restaurant_id == order.restaurant_id).all()
    suitable_couriers = []

    for courier in couriers:
        if courier.halal_mode and any(item.food_item.category == 'alcohol' for item in order.order_items):
            continue  # Skip couriers in halal mode if order contains alcohol

        if any(assignment.status in ['assigned', 'picked_up'] for assignment in courier.order_assignments):
            continue  # Skip busy couriers

        if courier.vehicle_type == 'bike' and calculate_distance(order.delivery_latitude, order.delivery_longitude, courier.restaurant.latitude, courier.restaurant.longitude) > 5:
            continue  # Skip if distance is more than 5 km for bike couriers

        if courier.vehicle_type == 'car' and calculate_distance(order.delivery_latitude, order.delivery_longitude, courier.restaurant.latitude, courier.restaurant.longitude) <= 5 and any(c.vehicle_type == 'bike' for c in couriers):
            continue  # Skip if distance is less than or equal to 5 km for car couriers and bike couriers are available

        if courier.wallet_amount < order.total_price:
            continue  # Skip if courier doesn't have enough change

        if courier.vehicle_type == 'bike' and sum(item.food_item.weight for item in order.order_items) > 6:
            continue  # Skip if order is heavier than 6 kg for bike couriers

        suitable_couriers.append(courier)

    if suitable_couriers:
        selected_courier = suitable_couriers[0]
        assignment = OrderAssignment(
            order_id=order.id,
            courier_id=selected_courier.id,
            status='assigned',
            assigned_at=datetime.datetime.utcnow()
        )
        db.add(assignment)
        db.commit()
        db.refresh(assignment)

        # Update bank balance for courier and customer
        update_bank_balance(order.customer_id, -order.total_price, db)
        update_bank_balance(selected_courier.user_id, order.total_price, db)
        
        return assignment

    return None

def update_bank_balance(user_id: int, amount: float, db: Session):
    bank = db.query(Bank).filter(Bank.user_id == user_id).first()
    if bank:
        bank.balance += amount
        db.commit()
        db.refresh(bank)

def calculate_distance(lat1, lon1, lat2, lon2):
    from geopy.distance import geodesic
    return geodesic((lat1, lon1), (lat2, lon2)).km
