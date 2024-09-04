from pydantic import BaseModel, EmailStr, Field, constr
from typing import List, Optional
from fastapi import UploadFile
from enum import Enum
import datetime

# Enums for categorization, status, and types
class ItemCategoryEnum(str, Enum):
    food = "food"
    drink = "drink"
    alcohol = "alcohol"
    other = "other"

class RestaurantCapacityEnum(str, Enum):
    normal = "normal"
    busy = "busy"
    crowded = "crowded"

class RequestTypeEnum(str, Enum):
    partner = "partner"
    deliver = "deliver"
    join = "join"

class RequestStatusEnum(str, Enum):
    pending = "pending"
    denied = "denied"
    accepted = "accepted"

class OrderStatusEnum(str, Enum):
    pending = "pending"
    preparing = "preparing"
    delivered = "delivered"
    cancelled = "cancelled"

class VehicleTypeEnum(str, Enum):
    bike = "bike"
    car = "car"

class OrderAssignmentStatusEnum(str, Enum):
    pending = "pending"
    in_delivery = "in_delivery"
    delivered = "delivered"

class CourierStatusEnum(str, Enum):
    online = "online"
    offline = "offline"
    busy = "busy"

class UpdateOrderStatusEnum(str, Enum):
    preparing = "preparing"
    cancelled = "cancelled"

class OrderQueueStatusEnum(str, Enum):
    pending = "pending"
    assigned = "assigned"

# Image schemas for handling image uploads and updates
class ImageCreate(BaseModel):
    image: bytes
    item_id: Optional[int]
    restaurant_id: Optional[int]

class ImageUpdate(BaseModel):
    image: Optional[bytes] = None
    item_id: Optional[int] = None
    restaurant_id: Optional[int] = None

# User schemas for handling user-related operations
class UserCreate(BaseModel):
    username: constr(min_length=6)
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    username: Optional[constr(min_length=1)] = Field(None)
    email: Optional[EmailStr] = Field(None)
    password: Optional[constr(min_length=6)] = Field(None)
    role: Optional[constr(min_length=1)] = Field(None)
    profilePicture: Optional[UploadFile] = None

# Operating Hours schemas for managing restaurant operating hours
class OperatingHoursCreate(BaseModel):
    restaurant_id: int
    day_of_week: str
    opening_time: datetime.time
    closing_time: datetime.time

class OperatingHoursUpdate(BaseModel):
    id: Optional[int] = None
    restaurant_id: Optional[int] = None
    day_of_week: Optional[str] = None
    opening_time: Optional[datetime.time] = None
    closing_time: Optional[datetime.time] = None

# Restaurant schemas for handling restaurant-related operations
class RestaurantCreate(BaseModel):
    name: str
    address: str
    city: str
    latitude: float
    longitude: float
    category: str
    contact: str
    owner_id: int
    delivery_zone_ids: List[int]  # Lista zona dostave
    capacity: RestaurantCapacityEnum = RestaurantCapacityEnum.normal
    image_ids: Optional[List[int]] = None

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None
    contact: Optional[str] = None
    owner_id: Optional[int] = None
    delivery_zone_ids: Optional[List[int]] = None  # Lista zona dostave
    capacity: Optional[RestaurantCapacityEnum] = None
    image_ids: Optional[List[int]] = None  # Lista slika
    operating_hours: Optional[List[OperatingHoursUpdate]] = None

# Item schemas for handling restaurant items (menu items)
class ItemCreate(BaseModel):
    name: str
    description: Optional[str]
    price: float
    weight: float
    preparation_time: int
    restaurant_id: int
    menu_category_id: int
    category: ItemCategoryEnum
    image_ids: Optional[List[int]] = None

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    weight: Optional[float] = None
    preparation_time: Optional[int] = None
    restaurant_id: Optional[int] = None
    menu_category_id: Optional[int] = None
    category: Optional[ItemCategoryEnum] = None
    image_ids: Optional[List[int]] = None  # Lista slika

# Menu Category schemas for handling restaurant menu categories
class MenuCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    restaurant_id: int

class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    restaurant_id: Optional[int] = None

# Order Item schemas for managing items within an order
class OrderItemCreate(BaseModel):
    item_id: int
    quantity: int
    price: float

# Order schemas for managing orders placed by customers
class OrderCreate(BaseModel):
    customer_id: int
    restaurant_id: int
    total_price: float
    delivery_address: str
    cutlery_included: Optional[bool] = None
    contact: str
    payment_method: str
    money: Optional[str] = None
    card_number: Optional[str] = None
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    customer_id: Optional[int] = None
    restaurant_id: Optional[int] = None
    total_price: Optional[float] = None
    status: Optional[OrderStatusEnum] = None
    delivery_address: Optional[str] = None
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    cutlery_included: Optional[bool] = None
    updated_at: Optional[datetime.datetime] = Field(default_factory=datetime.datetime.utcnow)
    contact: Optional[str] = None
    payment_method: Optional[str] = None
    money: Optional[str] = None
    card_number: Optional[str] = None

# Courier schemas for managing courier-related operations
class CourierCreate(BaseModel):
    user_id: int
    vehicle_type: VehicleTypeEnum
    halal_mode: bool
    restaurant_id: int

class CourierUpdate(BaseModel):
    user_id: Optional[int] = None
    vehicle_type: Optional[str] = None
    halal_mode: Optional[bool] = None
    wallet_amount: Optional[float] = None
    wallet_details: Optional[str] = None
    restaurant_id: Optional[int] = None
    online: Optional[bool] = None

# Order Assignment schemas for managing the assignment of orders to couriers
class OrderAssignmentCreate(BaseModel):
    order_id: int
    courier_id: int
    status: OrderAssignmentStatusEnum = OrderAssignmentStatusEnum.pending

class OrderAssignmentUpdate(BaseModel):
    order_id: Optional[int] = None
    courier_id: Optional[int] = None
    status: Optional[str] = None

# Rating schemas for managing ratings of orders and couriers
class RatingCreate(BaseModel):
    order_id: int
    restaurant_rating: float
    courier_rating: float
    comments: Optional[str]

# Chat schemas for managing chat messages between users
class ChatCreate(BaseModel):
    sender_id: int
    receiver_id: int
    message: str

# Email Report schemas for managing email reports sent to users
class EmailReportCreate(BaseModel):
    user_id: int
    report_type: str
    report_content: str

# Order Queue schemas for managing the queue of orders
class OrderQueueCreate(BaseModel):
    order_id: int
    status: OrderQueueStatusEnum = OrderQueueStatusEnum.pending
    estimated_preparation_time: int

class OrderQueueUpdate(BaseModel):
    order_id: Optional[int] = None
    status: Optional[str] = None
    estimated_preparation_time: Optional[int] = None

# Delivery Zone schemas for managing restaurant delivery zones
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
    name: Optional[str] = None
    point1_latitude: Optional[float] = None
    point1_longitude: Optional[float] = None
    point2_latitude: Optional[float] = None
    point2_longitude: Optional[float] = None
    point3_latitude: Optional[float] = None
    point3_longitude: Optional[float] = None
    point4_latitude: Optional[float] = None
    point4_longitude: Optional[float] = None

# Request schemas for managing different types of requests (partnership, delivery, etc.)
class RequestCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    additional_info: Optional[str] = None
    request_type: RequestTypeEnum

class RequestStatusUpdate(BaseModel):
    status: RequestStatusEnum

# Forgot Password schema for handling password reset requests
class ForgotPasswordRequest(BaseModel):
    email: str

class PasswordChangeRequest(BaseModel):
    oldPassword: str
    newPassword: str

class SearchQuery(BaseModel):
    query: constr(min_length=1, max_length=100)

class StatusUpdateRequest(BaseModel):
    id: int
    status: str

class UpdateOrderStatusSchema(BaseModel):
    status: UpdateOrderStatusEnum
