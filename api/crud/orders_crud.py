from sqlalchemy.orm import Session
from models.models import Order, OrderItem, Restaurant, User, OrderAssignment
from schemas.schemas import OrderCreate, OrderUpdate

# Funkcija za dohvatanje svih narudžbi
async def get_all_orders(db: Session):
    orders = db.query(Order).all()

    orders_with_details = []

    for order in orders:
        restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
        if not restaurant:
            raise HTTPException(status_code=404, detail=f"Restaurant with ID {order.restaurant_id} not found")

        customer = db.query(User).filter(User.id == order.customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail=f"Customer with ID {order.customer_id} not found")

        assignment = db.query(OrderAssignment).filter(OrderAssignment.order_id == order.id).first()
        if assignment:
            courier = db.query(User).filter(User.id == assignment.courier_id).first()
            courier_name = courier.username if courier else None
            assigned_at = assignment.assigned_at
        else:
            courier_name = None
            assigned_at = None

        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        items_details = []
        total_price = 0 

        for item in order_items:
            item_total = item.price * item.quantity
            total_price += item_total
            items_details.append({
                "name": item.item.name,
                "quantity": item.quantity,
                "price": item.price
            })

        order_details = {
            "id": order.id,
            "restaurant_name": restaurant.name,
            "restaurant_address": restaurant.address,
            "customer_name": customer.username,
            "customer_address": order.delivery_address,
            "courier_name": courier_name,
            "assigned_at": assigned_at,
            "total_price": total_price,
            "cutlery_included": order.cutlery_included,
            "created_at": order.created_at,
            "status": order.status.value,
            "order_items": items_details
        }

        orders_with_details.append(order_details)

    return orders_with_details

# Funkcija za ažuriranje postojeće narudžbe
async def update_order(db: Session, order_id: int, order: OrderUpdate):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        return None

    for key, value in order.dict(exclude_unset=True).items():
        setattr(db_order, key, value)

    db.commit()
    db.refresh(db_order)
    return db_order
