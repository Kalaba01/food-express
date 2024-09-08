from sqlalchemy.orm import Session
from datetime import datetime
from models.models import Order, OrderAssignment, Courier, Restaurant, OrderQueue, OrderStatus, OrderQueueStatusEnum, OrderAssignmentStatus, OrderAssignment

async def get_customer_orders(user_id: int, db: Session):
    orders = (
        db.query(Order)
        .filter(Order.customer_id == user_id, Order.status != OrderStatus.cancelled)
        .all()
    )

    order_details = []

    for order in orders:
        order_queue_entry = (
            db.query(OrderQueue)
            .filter(OrderQueue.order_id == order.id)
            .first()
        )
        assignment = (
            db.query(OrderAssignment)
            .filter(OrderAssignment.order_id == order.id)
            .first()
        )
        
        if assignment and assignment.customer_finish:
            continue

        courier = (
            db.query(Courier).filter(Courier.id == assignment.courier_id).first()
            if assignment
            else None
        )
        restaurant = (
            db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
        )

        status_column = "Waiting"
        time_value = None

        if order.status == OrderStatus.preparing:
            if order_queue_entry and order_queue_entry.status == OrderQueueStatusEnum.pending:
                status_column = "Preparing"
                time_value = order_queue_entry.estimated_preparation_time
            elif order_queue_entry and order_queue_entry.status == OrderQueueStatusEnum.assigned and assignment and assignment.status == OrderAssignmentStatus.in_delivery:
                status_column = "Delivering"
                time_value = assignment.estimated_delivery_time

        order_details.append(
            {
                "id": order.id,
                "courierUsername": courier.user.username if courier else None,
                "restaurantName": restaurant.name if restaurant else None,
                "restaurantAddress": restaurant.address if restaurant else None,
                "restaurantContact": restaurant.contact if restaurant else None,
                "latitude": restaurant.latitude if restaurant else None,
                "longitude": restaurant.longitude if restaurant else None,
                "price": order.total_price,
                "paymentMethod": order.payment_method.value,
                "statusColumn": status_column,
                "timeValue": time_value.isoformat() if time_value else None,
            }
        )

    return order_details
