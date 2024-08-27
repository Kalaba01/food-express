from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.models import Rating, Order, OrderAssignment
from schemas.schemas import RatingCreate

async def submit_rating(rating_data: RatingCreate, db: Session):
    order = db.query(Order).filter(Order.id == rating_data.order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    new_rating = Rating(
        order_id=rating_data.order_id,
        restaurant_id=order.restaurant_id,
        restaurant_rating=rating_data.restaurant_rating,
        courier_rating=rating_data.courier_rating,
        comments=rating_data.comments,
    )

    db.add(new_rating)

    assignment = db.query(OrderAssignment).filter(OrderAssignment.order_id == rating_data.order_id).first()

    if assignment:
        assignment.customer_finish = True
        db.commit()

    db.commit()

    return {"message": "Rating submitted successfully"}
