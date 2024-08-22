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


# Funkcija za dohvatanje pojedinačne narudžbe prema ID-u
async def get_order_by_id(db: Session, order_id: int):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None

    order_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    return {"order": order, "order_items": order_items}

# Funkcija za kreiranje nove narudžbe
async def new_order_create(db: Session, order: OrderCreate):
    new_order = Order(
        customer_id=order.customer_id,
        restaurant_id=order.restaurant_id,
        total_price=order.total_price,
        status=order.status,
        delivery_address=order.delivery_address,
        delivery_latitude=order.delivery_latitude,
        delivery_longitude=order.delivery_longitude,
        cutlery_included=order.cutlery_included,
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order

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

# Funkcija za brisanje narudžbe prema ID-u
async def delete_order(db: Session, order_id: int):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        return {"message": "Order not found"}

    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted successfully"}
