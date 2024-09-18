import json
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.models import (
    OrderAssignment,
    OrderAssignmentStatus,
    Order,
    OrderStatus,
    PaymentMethod,
    Restaurant,
    User,
    Item,
    OrderItem,
    Courier,
    CourierStatus,
)

# Retrieves the list of orders assigned to a specific courier for delivery, including order and customer details
async def get_orders_for_courier(db: Session, user_id: int):
    courier = db.query(Courier.id).filter(Courier.user_id == user_id).first()
    if not courier:
        return []

    courier_id = courier.id

    assignments = (
        db.query(
            OrderAssignment.id,
            OrderAssignment.optimal_change,
            Order.total_price,
            Order.payment_method,
            Restaurant.name.label("restaurant_name"),
            Restaurant.address.label("restaurant_address"),
            Restaurant.contact.label("restaurant_contact"),
            Restaurant.latitude.label("restaurant_latitude"),
            Restaurant.longitude.label("restaurant_longitude"),
            User.username.label("customer_username"),
            Order.delivery_address,
            Order.contact.label("customer_contact"),
            Order.delivery_latitude.label("customer_latitude"),
            Order.delivery_longitude.label("customer_longitude"),
            Order.id.label("order_id"),
        )
        .join(Order, OrderAssignment.order_id == Order.id)
        .join(Restaurant, Order.restaurant_id == Restaurant.id)
        .join(User, Order.customer_id == User.id)
        .filter(OrderAssignment.courier_id == courier_id)
        .filter(OrderAssignment.status == OrderAssignmentStatus.in_delivery)
        .all()
    )

    order_details = []
    for assignment in assignments:
        items = (
            db.query(Item.name, OrderItem.quantity, OrderItem.price)
            .join(Item, OrderItem.item_id == Item.id)
            .filter(OrderItem.order_id == assignment.order_id)
            .all()
        )

        item_list = [
            {"name": item.name, "quantity": item.quantity, "price": item.price}
            for item in items
        ]

        order_details.append(
            {
                "id": assignment.id,
                "restaurant_name": assignment.restaurant_name,
                "restaurant_address": assignment.restaurant_address,
                "restaurant_contact": assignment.restaurant_contact,
                "restaurant_latitude": assignment.restaurant_latitude,
                "restaurant_longitude": assignment.restaurant_longitude,
                "customer_username": assignment.customer_username,
                "customer_address": assignment.delivery_address,
                "customer_contact": assignment.customer_contact,
                "customer_latitude": assignment.customer_latitude,
                "customer_longitude": assignment.customer_longitude,
                "total_price": assignment.total_price,
                "payment_method": assignment.payment_method,
                "optimal_change": assignment.optimal_change,
                "items": item_list,
            }
        )

    return order_details

# Marks an order as finished (delivered), updates the courier's wallet if cash was used, and updates the status of the order and courier
async def finish_order(db: Session, order_id: int):
    print(f"Attempting to finish order with ID: {order_id}")
    assignment = (
        db.query(OrderAssignment).filter(OrderAssignment.id == order_id).first()
    )

    if not assignment:
        print(f"Order assignment not found for order ID: {order_id}")
        raise HTTPException(status_code=404, detail="Order not found")

    print(
        f"Customer finish status for order ID {order_id}: {assignment.customer_finish}"
    )
    if not assignment.customer_finish:
        print(
            f"Cannot finish order ID {order_id}: Customer has not confirmed the delivery."
        )
        raise HTTPException(
            status_code=400,
            detail="Can't finish order - customer has not confirmed the delivery",
        )

    order = db.query(Order).filter(Order.id == assignment.order_id).first()
    if not order:
        print(f"Order not found in orders table for order ID: {assignment.order_id}")
        raise HTTPException(status_code=404, detail="Order not found")

    courier = db.query(Courier).filter(Courier.id == assignment.courier_id).first()
    if not courier:
        print(f"Courier not found for courier ID: {assignment.courier_id}")
        raise HTTPException(status_code=404, detail="Courier not found")

    if order.payment_method == PaymentMethod.cash:
        print(
            f"Payment method is cash for order ID {order_id}. Updating courier wallet."
        )
        money_data = json.loads(order.money)
        wallet = json.loads(courier.wallet_details)

        for denomination, quantity in money_data.items():
            print(f"Adding {quantity} of {denomination}BAM to courier wallet.")
            wallet[denomination] = wallet.get(denomination, 0) + quantity

        if assignment.optimal_change:
            optimal_change = json.loads(assignment.optimal_change)
            print(f"Optimal change: {optimal_change}")
            for change in optimal_change:
                denomination, qty = change.split(" x ")
                qty = int(qty)
                denomination_key = f"{denomination}"
                print(
                    f"Removing {qty} of {denomination_key} from courier wallet as change."
                )

                if wallet.get(denomination_key, 0) >= qty:
                    if wallet[denomination_key] == qty:
                        print(f"Removing all {denomination_key} from courier wallet.")
                        del wallet[denomination_key]
                    else:
                        wallet[denomination_key] -= qty
                        print(
                            f"Updated {denomination_key} in courier wallet, new quantity: {wallet[denomination_key]}"
                        )
                else:
                    print(
                        f"Not enough {denomination_key} in wallet to return as change. Current quantity: {wallet.get(denomination_key, 0)}"
                    )

        print(f"Final courier wallet state before saving: {wallet}")

        courier.wallet_details = json.dumps(wallet)
        print(f"Courier wallet updated successfully for courier ID {courier.id}.")

    order.status = OrderStatus.delivered
    assignment.status = OrderAssignmentStatus.delivered
    assignment.courier_finish = True
    courier.status = CourierStatus.online

    db.commit()
    print(
        f"Order ID {order_id} marked as delivered and courier ID {courier.id} set to online."
    )

    return {"message": "Order successfully finished"}
