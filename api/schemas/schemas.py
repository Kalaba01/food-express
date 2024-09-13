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

# Enum for restaurant capacity status
class RestaurantCapacityEnum(str, Enum):
    normal = "normal"
    busy = "busy"
    crowded = "crowded"

# Enum for different request types
class RequestTypeEnum(str, Enum):
    partner = "partner"
    deliver = "deliver"
    join = "join"

# Enum for the status of a request
class RequestStatusEnum(str, Enum):
    pending = "pending"
    denied = "denied"
    accepted = "accepted"

# Enum for order status
class OrderStatusEnum(str, Enum):
    pending = "pending"
    preparing = "preparing"
    delivered = "delivered"
    cancelled = "cancelled"

# Enum for vehicle types used by couriers
class VehicleTypeEnum(str, Enum):
    bike = "bike"
    car = "car"

# Enum for the status of order assignments
class OrderAssignmentStatusEnum(str, Enum):
    pending = "pending"
    in_delivery = "in_delivery"
    delivered = "delivered"

# Enum for updating the status of an order
class UpdateOrderStatusEnum(str, Enum):
    preparing = "preparing"
    cancelled = "cancelled"

# Enum for the status of an order queue
class OrderQueueStatusEnum(str, Enum):
    pending = "pending"
    assigned = "assigned"

# Schema for creating an image
class ImageCreate(BaseModel):
    image: bytes
    item_id: Optional[int]
    restaurant_id: Optional[int]

# Schema for updating image details
class ImageUpdate(BaseModel):
    image: Optional[bytes] = None
    item_id: Optional[int] = None
    restaurant_id: Optional[int] = None

# Schema for creating a new user
class UserCreate(BaseModel):
    username: constr(min_length=6)
    email: EmailStr
    password: str

# Schema for updating user details
class UserUpdate(BaseModel):
    username: Optional[constr(min_length=1)] = Field(None)
    email: Optional[EmailStr] = Field(None)
    password: Optional[constr(min_length=6)] = Field(None)
    role: Optional[constr(min_length=1)] = Field(None)
    profilePicture: Optional[UploadFile] = None

# Schema for updating operating hours of a restaurant
class OperatingHoursUpdate(BaseModel):
    id: Optional[int] = None
    restaurant_id: Optional[int] = None
    day_of_week: Optional[str] = None
    opening_time: Optional[datetime.time] = None
    closing_time: Optional[datetime.time] = None

# Schema for creating a new restaurant
class RestaurantCreate(BaseModel):
    name: str
    address: str
    city: str
    latitude: float
    longitude: float
    category: str
    contact: str
    owner_id: int
    delivery_zone_ids: List[int]
    capacity: RestaurantCapacityEnum = RestaurantCapacityEnum.normal
    image_ids: Optional[List[int]] = None

# Schema for updating restaurant details
class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None
    contact: Optional[str] = None
    owner_id: Optional[int] = None
    delivery_zone_ids: Optional[List[int]] = None
    capacity: Optional[RestaurantCapacityEnum] = None
    image_ids: Optional[List[int]] = None
    operating_hours: Optional[List[OperatingHoursUpdate]] = None

# Schema for creating a new item
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

# Schema for updating item details
class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    weight: Optional[float] = None
    preparation_time: Optional[int] = None
    restaurant_id: Optional[int] = None
    menu_category_id: Optional[int] = None
    category: Optional[ItemCategoryEnum] = None
    image_ids: Optional[List[int]] = None

# Schema for creating a new menu category
class MenuCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    restaurant_id: int

# Schema for updating menu category details
class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    restaurant_id: Optional[int] = None

# Schema for creating an order item
class OrderItemCreate(BaseModel):
    item_id: int
    quantity: int
    price: float

# Schema for creating a new order
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

# Schema for updating order details
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

# Schema for creating a new courier
class CourierCreate(BaseModel):
    user_id: int
    vehicle_type: VehicleTypeEnum
    halal_mode: bool
    restaurant_id: int

# Schema for updating courier details
class CourierUpdate(BaseModel):
    user_id: Optional[int] = None
    vehicle_type: Optional[str] = None
    halal_mode: Optional[bool] = None
    wallet_amount: Optional[float] = None
    wallet_details: Optional[str] = None
    restaurant_id: Optional[int] = None
    online: Optional[bool] = None

# Schema for creating a rating for an order and courier
class RatingCreate(BaseModel):
    order_id: int
    restaurant_rating: float
    courier_rating: float
    comments: Optional[str]

# Schema for creating a new delivery zone
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

# Schema for updating delivery zone details
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

# Schema for creating a new request
class RequestCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    additional_info: Optional[str] = None
    request_type: RequestTypeEnum

# Schema for updating the status of a request
class RequestStatusUpdate(BaseModel):
    status: RequestStatusEnum

# Schema for requesting a password reset
class ForgotPasswordRequest(BaseModel):
    email: str

# Schema for changing the user's password
class PasswordChangeRequest(BaseModel):
    oldPassword: str
    newPassword: str

# Schema for handling search queries
class SearchQuery(BaseModel):
    query: constr(min_length=1, max_length=100)

# Schema for updating the status of an entity
class StatusUpdateRequest(BaseModel):
    id: int
    status: str

# Schema for updating the status of an order
class UpdateOrderStatusSchema(BaseModel):
    status: UpdateOrderStatusEnum
