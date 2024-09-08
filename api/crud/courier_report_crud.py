import os
from jinja2 import Environment, FileSystemLoader
from datetime import datetime, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session
from models.models import Restaurant, Order, OrderStatus, User, Courier
from utils.email_utils import send_report_email

templates_path = os.path.join(os.path.dirname(__file__), '../utils')
env = Environment(loader=FileSystemLoader(templates_path))

async def courier_report(db: Session):
    print("Funkcija za slanje reporta kuririma!")
    
    couriers = db.query(User).filter(User.role == 'courier').all()
    
    if not couriers:
        raise Exception("No couriers found.")
    
    for courier in couriers:
        print(f"Kurir: {courier.username}")
        
        restaurants = db.query(Restaurant).join(Courier).filter(Courier.user_id == courier.id).all()
        report_data = []
        total_delivered = 0
        total_earnings = 0
        
        for restaurant in restaurants:
            start_time = datetime.utcnow() - timedelta(days=1)
            delivered_orders = db.query(Order).filter(
                Order.restaurant_id == restaurant.id,
                Order.status == OrderStatus.delivered,
                Order.updated_at >= start_time,
                Order.order_assignments.any(courier_id=courier.id)
            ).count()
            
            total_earnings_restaurant = db.query(Order).filter(
                Order.restaurant_id == restaurant.id,
                Order.status == OrderStatus.delivered,
                Order.updated_at >= start_time,
                Order.order_assignments.any(courier_id=courier.id)
            ).with_entities(func.sum(Order.total_price)).scalar() or 0
            
            report_data.append({
                "name": restaurant.name,
                "delivered_orders": delivered_orders,
                "total_earnings": total_earnings_restaurant
            })
            
            total_delivered += delivered_orders
            total_earnings += total_earnings_restaurant
        
        template = env.get_template("courier_report.html")
        email_body = template.render(
            courier_name=courier.username,
            restaurants=report_data,
            total_delivered_orders=total_delivered,
            total_earnings=total_earnings
        )
        
        subject = f"Daily Report for Courier {courier.username}"
        await send_report_email(courier.email, subject, email_body)
