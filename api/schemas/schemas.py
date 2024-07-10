from pydantic import BaseModel

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class RestaurantBase(BaseModel):
    name: str
    address: str
    city: str
    latitude: float
    longitude: float
    rating: int
    category: str

class RestaurantCreate(RestaurantBase):
    pass

class Restaurant(RestaurantBase):
    id: int

    class Config:
        orm_mode = True
