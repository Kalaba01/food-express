from sqlalchemy.orm import Session
from models.models import DeliveryZone, Restaurant
from schemas.schemas import DeliveryZoneCreate, DeliveryZoneUpdate

# Sets the delivery_zone_id of all restaurants in the specified zone to None (removes the association with the zone)
def nullify_restaurant_zones(db: Session, zone_id: int):
    restaurants = db.query(Restaurant).filter(Restaurant.delivery_zone_id == zone_id).all()
    for restaurant in restaurants:
        restaurant.delivery_zone_id = None
    
    db.commit()

# Retrieves all delivery zones from the database
async def get_all_zones(db: Session):
    return db.query(DeliveryZone).all()

# Creates a new delivery zone in the database based on provided data
async def create_zone(db: Session, zone: DeliveryZoneCreate):
    db_zone = DeliveryZone(**zone.dict())
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

# Updates an existing delivery zone with the provided data
async def update_zone(db: Session, zone_id: int, zone: DeliveryZoneUpdate):
    db_zone = db.query(DeliveryZone).filter(DeliveryZone.id == zone_id).first()
    if not db_zone:
        return None
    for key, value in zone.dict(exclude_unset=True).items():
        setattr(db_zone, key, value)
    db.commit()
    db.refresh(db_zone)
    return db_zone

# Deletes a delivery zone by ID, and nullifies the delivery_zone_id for all associated restaurants
def delete_delivery_zone_by_id(db: Session, zone_id: int):
    zone = db.query(DeliveryZone).filter(DeliveryZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    nullify_restaurant_zones(db, zone_id)
    
    db.delete(zone)
    db.commit()
    
    return {"message": "Zone deleted successfully, and associated restaurants' delivery_zone_id set to NULL"}
