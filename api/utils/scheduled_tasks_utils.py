import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.models import Request
from utils.email_utils import send_email

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
            body = (
                f"Dear {request.first_name} {request.last_name},\n\n"
                "After a thorough review of your request, we regret to inform you that it has been denied.\n"
                "We appreciate your interest in joining us and encourage you to apply again in the future.\n\n"
                "If you have any questions or need further assistance, please do not hesitate to contact us at foodexpressproject@outlook.com.\n\n"
                "Best regards,\n"
                "The Food Express Team\n"
                "https://www.foodexpress.com"
            )
            await send_email(request.email, subject, body)
        db.commit()
    except Exception as e:
        print(f"Error while changing status and sending emails: {e}")
    finally:
        db.close()


async def remind_pending_requests():
    db = SessionLocal()
    try:
        requests = db.query(Request).filter(Request.status == "pending").all()
        for request in requests:
            subject = "Your Request is Still Under Review"
            body = (
                f"Dear {request.first_name} {request.last_name},\n\n"
                "Thank you for your patience. We wanted to let you know that your request is still under review and will be processed as soon as possible.\n\n"
                "We appreciate your understanding and will get back to you with an update shortly.\n\n"
                "If you have any questions in the meantime, please feel free to contact us at foodexpressproject@outlook.com.\n\n"
                "Best regards,\n"
                "The Food Express Team\n"
                "https://www.foodexpress.com"
            )
            await send_email(request.email, subject, body)
    except Exception as e:
        print(f"Error while sending reminder emails: {e}")
    finally:
        db.close()
