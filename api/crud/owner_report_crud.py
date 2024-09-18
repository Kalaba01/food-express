import os
from jinja2 import Environment, FileSystemLoader
from datetime import datetime, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session
from aiosmtplib import send
from models.models import Restaurant, Order, OrderStatus, User
from utils.email_utils import send_report_email


templates_path = os.path.join(os.path.dirname(__file__), '../utils')
env = Environment(loader=FileSystemLoader(templates_path))

# Generates and sends a daily report to each restaurant owner
async def owner_report(db: Session):
    owners = db.query(User).filter(User.role == 'owner').all()

    if not owners:
        raise Exception("No restaurant owners found")

    for owner in owners:
        restaurants = db.query(Restaurant).filter(Restaurant.owner_id == owner.id).all()
        report_data = []
        total_delivered = 0
        total_cancelled = 0
        total_earnings = 0

        for restaurant in restaurants:
            start_time = datetime.utcnow() - timedelta(days=1)
            delivered_orders = db.query(Order).filter(
                Order.restaurant_id == restaurant.id,
                Order.status == OrderStatus.delivered,
                Order.updated_at >= start_time
            ).count()

            cancelled_orders = db.query(Order).filter(
                Order.restaurant_id == restaurant.id,
                Order.status == OrderStatus.cancelled,
                Order.updated_at >= start_time
            ).count()

            total_earnings_restaurant = db.query(Order).filter(
                Order.restaurant_id == restaurant.id,
                Order.status == OrderStatus.delivered,
                Order.updated_at >= start_time
            ).with_entities(func.sum(Order.total_price)).scalar() or 0

            report_data.append({
                "name": restaurant.name,
                "delivered_orders": delivered_orders,
                "cancelled_orders": cancelled_orders,
                "total_earnings": total_earnings_restaurant
            })

            total_delivered += delivered_orders
            total_cancelled += cancelled_orders
            total_earnings += total_earnings_restaurant

        template = env.get_template("owner_report.html")
        email_body = template.render(
            owner_name=owner.username,
            restaurants=report_data,
            total_delivered_orders=total_delivered,
            total_cancelled_orders=total_cancelled,
            total_earnings=total_earnings
        )

        subject = f"Daily Report for {owner.username}"
        await send_report_email(owner.email, subject, email_body)
