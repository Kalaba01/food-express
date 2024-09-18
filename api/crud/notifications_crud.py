import pytz
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.models import Notification

# Retrieves all notifications for a specific user, ordered by creation date in descending order
def get_notifications(db: Session, user_id: int):
    return db.query(Notification).filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()

# Marks a specific notification as read based on the notification_id
async def mark_as_read(db: Session, notification_id: int):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.read = True
    db.commit()
    
    return {"message": "Notification marked as read"}
