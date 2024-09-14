from sqlalchemy.orm import Session
from models.models import User

async def search_owners(db: Session, username: str):
    owners = (
        db.query(User)
        .filter(User.username.ilike(f"%{username.strip()}%"), User.role == "owner")
        .all()
    )
    return [{"id": owner.id, "username": owner.username} for owner in owners]
