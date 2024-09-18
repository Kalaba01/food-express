import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.models import Request
from utils.email_utils import send_email
from utils.email_templates_utils import request_denied_email, request_reminder_email

# Denies pending requests without additional information and sends denial emails
async def deny_requests_and_send_emails():
    db = SessionLocal()
    try:
        requests = (
            db.query(Request)
            .filter(Request.additional_info == None, Request.status == "pending")
            .all()
        )
        for request in requests:
            request.status = "denied"
            db.add(request)
            subject = "Your Request Has Been Denied"
            body = request_denied_email(request.first_name, request.last_name)
            await send_email(request.email, subject, body)
        db.commit()
    except Exception as e:
        print(f"Error while changing status and sending emails: {e}")
    finally:
        db.close()

# Sends reminder emails to users with pending requests
async def remind_pending_requests():
    db = SessionLocal()
    try:
        requests = db.query(Request).filter(Request.status == "pending").all()
        for request in requests:
            subject = "Your Request is Still Under Review"
            body = request_reminder_email(request.first_name, request.last_name)
            await send_email(request.email, subject, body)
    except Exception as e:
        print(f"Error while sending reminder emails: {e}")
    finally:
        db.close()
