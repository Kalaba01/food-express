from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import OrderStatus, Order, OrderItem, Item, Restaurant, User
from schemas.schemas import UpdateOrderStatusSchema

async def get_pending_orders_for_owner(db: Session, owner_id: int):
    # Prvo dobijamo sve restorane koje poseduje vlasnik
    restaurants = db.query(Restaurant).filter(Restaurant.owner_id == owner_id).all()
    if not restaurants:
        raise HTTPException(status_code=404, detail="No restaurants found for the owner.")

    restaurant_ids = [restaurant.id for restaurant in restaurants]

    # Zatim dobijamo sve narudžbine sa statusom 'pending' za te restorane
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
                "category": item.category.value
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
    
    # Validiramo status koristeći OrderStatus Enum
    if status not in [OrderStatus.preparing.value, OrderStatus.cancelled.value]:
        raise HTTPException(status_code=400, detail="Invalid status value.")

    order.status = status
    db.commit()
    db.refresh(order)
    return {"message": f"Order status updated to {status}."}
