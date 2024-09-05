from sqlalchemy.orm import Session
from models.models import Order, OrderItem, OrderAssignment, OrderAssignmentStatus, Courier

async def get_delivered_orders(db: Session, user_id: int):
    courier = db.query(Courier).filter(Courier.user_id == user_id).first()

    if not courier:
        return []

    assignments = db.query(OrderAssignment).filter(
        OrderAssignment.courier_id == courier.id,
        OrderAssignment.status == OrderAssignmentStatus.delivered
    ).all()

    orders_data = []

    for assignment in assignments:
        order = assignment.order 
        restaurant = order.restaurant
        customer = order.customer

        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        items_data = [
            {
                "name": item.item.name,
                "quantity": item.quantity,
                "price": item.price
            }
            for item in order_items
        ]

        orders_data.append({
            "id": order.id,
            "restaurant_name": restaurant.name,
            "restaurant_address": restaurant.address,
            "customer_username": customer.username,
            "customer_address": order.delivery_address,
            "total_price": order.total_price,
            "items": items_data
        })

    return orders_data
