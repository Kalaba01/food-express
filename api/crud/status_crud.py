from sqlalchemy.orm import Session
from models.models import Courier

async def get_courier_status(db: Session, courier_id: int):
    courier = db.query(Courier).filter(Courier.id == courier_id).first()
    if not courier:
        raise HTTPException(status_code=404, detail="Courier not found")
    return {"status": courier.status}

async def update_courier_status(db: Session, courier_id: int, new_status: str):
    courier = db.query(Courier).filter(Courier.id == courier_id).first()
    if not courier:
        raise HTTPException(status_code=404, detail="Courier not found")

    courier.status = new_status
    db.commit()
    db.refresh(courier)
    return {"status": courier.status}
