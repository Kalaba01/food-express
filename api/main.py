from fastapi import FastAPI, Depends, HTTPException
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine, get_db
from models.models import Base, User, Request, RequestStatus
from schemas.schemas import UserCreate, UserLogin, RequestCreate
from utils.utils import hash_password, verify_password
from auth.auth import create_access_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm

def start_application():
    app = FastAPI() 
    origins = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins = origins,
        allow_credentials = True,
        allow_methods = ["*"],
        allow_headers = ["*"]
    )
    return app

app = start_application()

# Kreiranje tabela prilikom pokretanja aplikacije
Base.metadata.create_all(bind=engine)

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token")
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == form_data.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    if not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Rute za upravljanje zahtevima (partner, driver, team)
@app.post("/requests/")
def create_request(request: RequestCreate, db: Session = Depends(get_db)):
    new_request = Request(**request.dict())
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@app.get("/requests/")
def get_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Request).offset(skip).limit(limit).all()

@app.get("/requests/{request_id}")
def get_request(request_id: int, db: Session = Depends(get_db)):
    db_request = db.query(Request).filter(Request.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return db_request

@app.put("/requests/{request_id}/status")
def update_request_status(request_id: int, status: RequestStatus, db: Session = Depends(get_db)):
    db_request = db.query(Request).filter(Request.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    db_request.status = status
    db.commit()
    db.refresh(db_request)
    return db_request

@app.delete("/requests/{request_id}")
def delete_request(request_id: int, db: Session = Depends(get_db)):
    db_request = db.query(Request).filter(Request.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(db_request)
    db.commit()
    return db_request
