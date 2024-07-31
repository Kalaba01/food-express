from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, Enum, Time
from sqlalchemy.orm import relationship
from database.database import Base
import datetime
import enum

class ItemCategory(enum.Enum):
    food = "food"
    drink = "drink"
    alcohol = "alcohol"
    other = "other"

class RestaurantCapacity(enum.Enum):
    normal = "normal"
    busy = "busy"
    crowded = "crowded"

class RequestType(enum.Enum):
    partner = "partner"
    driver = "driver"
    team = "team"

class RequestStatus(enum.Enum):
    pending = "pending"
    denied = "denied"
    accepted = "accepted"

class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=True)

    item = relationship("Item", back_populates="images")
    restaurant = relationship("Restaurant", back_populates="images")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'administrator', 'owner', 'courier', 'customer'
    image_id = Column(Integer, ForeignKey("images.id"), nullable=True)  # Dodata kolona za sliku

    owned_restaurants = relationship("Restaurant", back_populates="owner")
    couriers = relationship("Courier", back_populates="user")
    orders = relationship("Order", back_populates="customer")
    chat_sent = relationship("Chat", foreign_keys="[Chat.sender_id]", back_populates="sender")
    chat_received = relationship("Chat", foreign_keys="[Chat.receiver_id]", back_populates="receiver")
    notifications = relationship("Notification", back_populates="user")
    email_reports = relationship("EmailReport", back_populates="user")
    bank_account = relationship("Bank", back_populates="user", uselist=False)
    image = relationship("Image")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user")

class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    rating = Column(Integer, nullable=False)
    category = Column(String, nullable=False)
    contact = Column(String, nullable=False)  # Dodata kolona za kontakt broj telefona
    owner_id = Column(Integer, ForeignKey("users.id"))
    delivery_zone_id = Column(Integer, ForeignKey("delivery_zones.id"))
    capacity = Column(Enum(RestaurantCapacity), nullable=False, default=RestaurantCapacity.normal)

    owner = relationship("User", back_populates="owned_restaurants")
    items = relationship("Item", back_populates="restaurant")
    menu_categories = relationship("MenuCategory", back_populates="restaurant")
    orders = relationship("Order", back_populates="restaurant")
    couriers = relationship("Courier", back_populates="restaurant")
    delivery_zone = relationship("DeliveryZone", back_populates="restaurants")
    images = relationship("Image", back_populates="restaurant")
    operating_hours = relationship("OperatingHours", back_populates="restaurant")

class OperatingHours(Base):
    __tablename__ = "operating_hours"
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    day_of_week = Column(String, nullable=False)  # 'Monday', 'Tuesday', etc.
    opening_time = Column(Time, nullable=False)
    closing_time = Column(Time, nullable=False)

    restaurant = relationship("Restaurant", back_populates="operating_hours")

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)
    preparation_time = Column(Integer, nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    menu_category_id = Column(Integer, ForeignKey("menu_categories.id"))  # Dodata kolona za povezivanje sa kategorijom menija
    category = Column(Enum(ItemCategory), nullable=False)

    restaurant = relationship("Restaurant", back_populates="items")
    menu_category = relationship("MenuCategory", back_populates="items")
    order_items = relationship("OrderItem", back_populates="item")
    images = relationship("Image", back_populates="item")

class MenuCategory(Base):
    __tablename__ = "menu_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))

    restaurant = relationship("Restaurant", back_populates="menu_categories")
    items = relationship("Item", back_populates="menu_category")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    total_price = Column(Float, nullable=False)
    status = Column(String, nullable=False)  # 'pending', 'confirmed', 'in_delivery', 'delivered', 'cancelled'
    delivery_address = Column(String, nullable=False)
    delivery_latitude = Column(Float, nullable=False)
    delivery_longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    cutlery_included = Column(Boolean, default=False)

    customer = relationship("User", back_populates="orders")
    restaurant = relationship("Restaurant", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")
    order_assignments = relationship("OrderAssignment", back_populates="order")
    ratings = relationship("Rating", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    item_id = Column(Integer, ForeignKey("items.id"))
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="order_items")
    item = relationship("Item", back_populates="order_items")

class Courier(Base):
    __tablename__ = "couriers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vehicle_type = Column(String, nullable=False)  # 'bike', 'car'
    halal_mode = Column(Boolean, default=False)
    wallet_amount = Column(Float, nullable=False)
    wallet_details = Column(Text, nullable=False)  # JSON format to store denominations
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))

    user = relationship("User", back_populates="couriers")
    restaurant = relationship("Restaurant", back_populates="couriers")
    order_assignments = relationship("OrderAssignment", back_populates="courier")

class OrderAssignment(Base):
    __tablename__ = "order_assignments"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    courier_id = Column(Integer, ForeignKey("couriers.id"))
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, nullable=False)  # 'assigned', 'picked_up', 'delivered'

    order = relationship("Order", back_populates="order_assignments")
    courier = relationship("Courier", back_populates="order_assignments")

class Rating(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    restaurant_rating = Column(Integer, nullable=False)
    courier_rating = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)

    order = relationship("Order", back_populates="ratings")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    read = Column(Boolean, default=False)

    user = relationship("User", back_populates="notifications")

class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="chat_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="chat_received")

class EmailReport(Base):
    __tablename__ = "email_reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    report_type = Column(String, nullable=False)  # 'administrator', 'owner'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    report_content = Column(Text, nullable=False)  # JSON format

    user = relationship("User", back_populates="email_reports")

class OrderQueue(Base):
    __tablename__ = "order_queue"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    status = Column(String, nullable=False)  # 'waiting', 'assigned'

    order = relationship("Order")

class DeliveryZone(Base):
    __tablename__ = "delivery_zones"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    point1_latitude = Column(Float, nullable=False)
    point1_longitude = Column(Float, nullable=False)
    point2_latitude = Column(Float, nullable=False)
    point2_longitude = Column(Float, nullable=False)
    point3_latitude = Column(Float, nullable=False)
    point3_longitude = Column(Float, nullable=False)
    point4_latitude = Column(Float, nullable=False)
    point4_longitude = Column(Float, nullable=False)

    restaurants = relationship("Restaurant", back_populates="delivery_zone")

class Bank(Base):
    __tablename__ = "banks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    balance = Column(Float, nullable=False)
    account_number = Column(String, unique=True, nullable=False)

    user = relationship("User", back_populates="bank_account")

class Request(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    additional_info = Column(String, nullable=False)
    request_type = Column(String, nullable=False)  # 'partner', 'driver', 'team'
    status = Column(Enum(RequestStatus), default=RequestStatus.pending)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String, unique=True, nullable=False)
    expiration = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="password_reset_tokens")
