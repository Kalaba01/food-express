from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
import datetime

class ItemCategoryEnum(str, Enum):
    food = "food"
    drink = "drink"
    alcohol = "alcohol"
    other = "other"

class RestaurantCapacityEnum(str, Enum):
    normal = "normal"
    busy = "busy"
    crowded = "crowded"

# Slike
class ImageCreate(BaseModel):
    url: str
    item_id: Optional[int]
    restaurant_id: Optional[int]

class ImageUpdate(BaseModel):
    url: Optional[str]
    item_id: Optional[int]
    restaurant_id: Optional[int]

# Korisnici
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str  # 'administrator', 'owner', 'courier', 'customer'
    image_id: Optional[int]

class UserUpdate(BaseModel):
    username: Optional[str]
    email: Optional[str]
    password: Optional[str]
    role: Optional[str]
    image_id: Optional[int]

# Restorani
class RestaurantCreate(BaseModel):
    name: str
    address: str
    city: str
    latitude: float
    longitude: float
    rating: int
    category: str
    contact: str
    owner_id: int
    delivery_zone_id: int
    capacity: RestaurantCapacityEnum
    image_ids: Optional[List[int]]  # Lista slika

class RestaurantUpdate(BaseModel):
    name: Optional[str]
    address: Optional[str]
    city: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    rating: Optional[int]
    category: Optional[str]
    contact: Optional[str]
    delivery_zone_id: Optional[int]
    capacity: Optional[RestaurantCapacityEnum]
    image_ids: Optional[List[int]]  # Lista slika

# Radno vreme
class OperatingHoursCreate(BaseModel):
    restaurant_id: int
    day_of_week: str
    opening_time: datetime.time
    closing_time: datetime.time

class OperatingHoursUpdate(BaseModel):
    restaurant_id: Optional[int]
    day_of_week: Optional[str]
    opening_time: Optional[datetime.time]
    closing_time: Optional[datetime.time]

# Artikli
class ItemCreate(BaseModel):
    name: str
    description: Optional[str]
    price: float
    weight: float
    preparation_time: int
    restaurant_id: int
    menu_category_id: int
    category: ItemCategoryEnum
    image_ids: Optional[List[int]]  # Lista slika

class ItemUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    price: Optional[float]
    weight: Optional[float]
    preparation_time: Optional[int]
    restaurant_id: Optional[int]
    menu_category_id: Optional[int]
    category: Optional[ItemCategoryEnum]
    image_ids: Optional[List[int]]  # Lista slika

# Kategorije menija
class MenuCategoryCreate(BaseModel):
    name: str
    description: Optional[str]
    restaurant_id: int

class MenuCategoryUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    restaurant_id: Optional[int]

# Narudžbe
class OrderCreate(BaseModel):
    customer_id: int
    restaurant_id: int
    total_price: float
    status: str
    delivery_address: str
    delivery_latitude: float
    delivery_longitude: float
    cutlery_included: bool

# Stavke narudžbi
class OrderItemCreate(BaseModel):
    order_id: int
    item_id: int
    quantity: int
    price: float

# Kuriri
class CourierCreate(BaseModel):
    user_id: int
    vehicle_type: str  # 'bike', 'car'
    halal_mode: bool
    wallet_amount: float
    wallet_details: str
    restaurant_id: int

class CourierUpdate(BaseModel):
    user_id: Optional[int]
    vehicle_type: Optional[str]
    halal_mode: Optional[bool]
    wallet_amount: Optional[float]
    wallet_details: Optional[str]
    restaurant_id: Optional[int]

# Dodjele narudžbi
class OrderAssignmentCreate(BaseModel):
    order_id: int
    courier_id: int
    status: str  # 'assigned', 'picked_up', 'delivered'

class OrderAssignmentUpdate(BaseModel):
    order_id: Optional[int]
    courier_id: Optional[int]
    status: Optional[str]

# Ocjene
class RatingCreate(BaseModel):
    order_id: int
    restaurant_rating: int
    courier_rating: int
    comments: Optional[str]

# Notifikacije
class NotificationCreate(BaseModel):
    user_id: int
    message: str
    read: bool

class NotificationUpdate(BaseModel):
    user_id: Optional[int]
    message: Optional[str]
    read: Optional[bool]

# Chat
class ChatCreate(BaseModel):
    sender_id: int
    receiver_id: int
    message: str

# Email Izvještaji
class EmailReportCreate(BaseModel):
    user_id: int
    report_type: str
    report_content: str

# Queue narudžbi
class OrderQueueCreate(BaseModel):
    order_id: int
    status: str

class OrderQueueUpdate(BaseModel):
    order_id: Optional[int]
    status: Optional[str]

# Delivery zone
class DeliveryZoneCreate(BaseModel):
    name: str
    point1_latitude: float
    point1_longitude: float
    point2_latitude: float
    point2_longitude: float
    point3_latitude: float
    point3_longitude: float
    point4_latitude: float
    point4_longitude: float

class DeliveryZoneUpdate(BaseModel):
    name: Optional[str]
    point1_latitude: Optional[float]
    point1_longitude: Optional[float]
    point2_latitude: Optional[float]
    point2_longitude: Optional[float]
    point3_latitude: Optional[float]
    point3_longitude: Optional[float]
    point4_latitude: Optional[float]
    point4_longitude: Optional[float]

# Bank
class BankCreate(BaseModel):
    user_id: int
    balance: float

class BankUpdate(BaseModel):
    user_id: Optional[int]
    balance: Optional[float]

# Zahtevi za partnerstvo
class PartnershipRequestCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    restaurant_name: str
    address: str
    city: str
    restaurant_type: str
