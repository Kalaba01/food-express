from sqlalchemy.orm import Session
from models.models import Order, Restaurant, OrderItem, Item

async def get_customer_order_history_with_items(db: Session, customer_id: int):
    orders = db.query(
        Order.id,
        Order.restaurant_id,
        Order.total_price,
        Order.status,
        Restaurant.name.label('restaurant_name'),
        Restaurant.category.label('restaurant_category'),
        Restaurant.contact.label('restaurant_contact')
    ).join(Restaurant, Order.restaurant_id == Restaurant.id
    ).filter(Order.customer_id == customer_id, Order.status == 'delivered'
    ).all()

    order_details = []
    for order in orders:
        items = db.query(
            Item.id.label('item_id'),
            Item.name,
            OrderItem.quantity,
            OrderItem.price,
            Item.category
        ).join(Item, OrderItem.item_id == Item.id
        ).filter(OrderItem.order_id == order.id
        ).all()

        item_list = [{
            "item_id": item.item_id,
            "name": item.name,
            "quantity": item.quantity,
            "price": item.price,
            "category": item.category
        } for item in items]

        order_details.append({
            "id": order.id,
            "restaurant_id": order.restaurant_id,
            "restaurant_name": order.restaurant_name,
            "restaurant_category": order.restaurant_category,
            "restaurant_contact": order.restaurant_contact,
            "total_price": order.total_price,
            "items": item_list
        })
    
    return order_details
