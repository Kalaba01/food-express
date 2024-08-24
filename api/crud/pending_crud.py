from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from models.models import OrderStatus, Order, OrderItem, OrderQueue, Item, Restaurant, User, RestaurantCapacity
from schemas.schemas import UpdateOrderStatusSchema, OrderQueueStatusEnum

async def get_pending_orders_for_owner(db: Session, owner_id: int):
    restaurants = db.query(Restaurant).filter(Restaurant.owner_id == owner_id).all()
    if not restaurants:
        raise HTTPException(status_code=404, detail="No restaurants found for the owner.")

    restaurant_ids = [restaurant.id for restaurant in restaurants]

    orders = db.query(Order).filter(
        Order.restaurant_id.in_(restaurant_ids),
        Order.status == OrderStatus.pending
    ).all()

    if not orders:
        raise HTTPException(status_code=404, detail="No pending orders found.")

    order_details = []
    for order in orders:
        customer = db.query(User).filter(User.id == order.customer_id).first()
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        items_details = []
        for order_item in order_items:
            item = db.query(Item).filter(Item.id == order_item.item_id).first()
            items_details.append({
                "name": item.name,
                "description": item.description,
                "price": item.price,
                "category": item.category.value,
                "quantity": order_item.quantity
            })

        order_details.append({
            "order_id": order.id,
            "customer_name": customer.username,
            "total_price": order.total_price,
            "delivery_address": order.delivery_address,
            "cutlery_included": order.cutlery_included,
            "items": items_details
        })

    return order_details

async def update_order_status(db: Session, order_id: int, status: str):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    
    if status not in [OrderStatus.preparing.value, OrderStatus.cancelled.value]:
        raise HTTPException(status_code=400, detail="Invalid status value.")

    order.status = status
    db.commit()
    db.refresh(order)

    if status == OrderStatus.preparing.value:
        max_prep_time = max(
            db.query(Item.preparation_time)
              .join(OrderItem, Item.id == OrderItem.item_id)
              .filter(OrderItem.order_id == order_id)
              .all()
        )[0]

        capacity_coefficient = {
            RestaurantCapacity.normal: 1,
            RestaurantCapacity.busy: 1.25,
            RestaurantCapacity.crowded: 1.5,
        }[order.restaurant.capacity]

        estimated_prep_time = int(max_prep_time * capacity_coefficient)

        total_weight = db.query(
            func.sum(Item.weight * OrderItem.quantity)
        ).join(OrderItem, Item.id == OrderItem.item_id).filter(OrderItem.order_id == order_id).scalar()

        if total_weight is None:
            total_weight = 0.0

        new_queue_entry = OrderQueue(
            order_id=order.id,
            status=OrderQueueStatusEnum.pending,
            estimated_preparation_time=estimated_prep_time,
            weight=total_weight
        )
        db.add(new_queue_entry)
        db.commit()
        db.refresh(new_queue_entry)

    return {"message": "Order accepted"}
