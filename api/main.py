from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine
from models.models import Base, User, Restaurant, PartnershipRequest
from schemas.schemas import UserCreate, RestaurantCreate, PartnershipRequestCreate
from crud import partnership_requests

app = FastAPI()

# Kreiranje tabela prilikom pokretanja aplikacije
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Definišemo rute za PartnershipRequest
@app.post("/partnership_requests/")
def create_partnership_request(partnership_request: PartnershipRequestCreate, db: Session = Depends(get_db)):
    return partnership_requests.create_partnership_request(db=db, partnership_request=partnership_request)

@app.get("/partnership_requests/")
def get_partnership_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return partnership_requests.get_partnership_requests(db=db, skip=skip, limit=limit)

@app.get("/partnership_requests/{partnership_request_id}")
def get_partnership_request(partnership_request_id: int, db: Session = Depends(get_db)):
    db_partnership_request = partnership_requests.get_partnership_request(db=db, partnership_request_id=partnership_request_id)
    if db_partnership_request is None:
        raise HTTPException(status_code=404, detail="Partnership request not found")
    return db_partnership_request

@app.delete("/partnership_requests/{partnership_request_id}")
def delete_partnership_request(partnership_request_id: int, db: Session = Depends(get_db)):
    db_partnership_request = partnership_requests.delete_partnership_request(db=db, partnership_request_id=partnership_request_id)
    if db_partnership_request is None:
        raise HTTPException(status_code=404, detail="Partnership request not found")
    return db_partnership_request
