from sqlalchemy.orm import Session
from models.models import DeliveryZone
from schemas.schemas import DeliveryZoneCreate, DeliveryZoneUpdate

async def get_all_zones(db: Session):
    return db.query(DeliveryZone).all()

async def create_zone(db: Session, zone: DeliveryZoneCreate):
    db_zone = DeliveryZone(**zone.dict())
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

async def update_zone(db: Session, zone_id: int, zone: DeliveryZoneUpdate):
    db_zone = db.query(DeliveryZone).filter(DeliveryZone.id == zone_id).first()
    if not db_zone:
        return None
    for key, value in zone.dict(exclude_unset=True).items():
        setattr(db_zone, key, value)
    db.commit()
    db.refresh(db_zone)
    return db_zone
