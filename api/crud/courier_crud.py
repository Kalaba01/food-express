from sqlalchemy.orm import Session
from models.models import OrderAssignment, OrderAssignmentStatus, Courier

# Checks if a courier has any unfinished (in delivery) orders
async def has_unfinished_orders(db: Session, user_id: int) -> bool:
    return db.query(OrderAssignment).join(Courier).filter(
        Courier.user_id == user_id,
        OrderAssignment.status == OrderAssignmentStatus.in_delivery
    ).count() > 0
