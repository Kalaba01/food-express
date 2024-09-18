# Food-Express

Food-Express is a full-stack application designed to manage food ordering and delivery services, built using FastAPI for the backend, React for the frontend, and SQLAlchemy for database management. Users can browse restaurants, place orders, track their delivery, and rate restaurants and couriers. The platform includes roles for customers, restaurant owners, couriers, and administrators, each having tailored functionality. The system supports real-time order tracking, user authentication with JWT, and multi-language support.

## Project Architecture

### Backend Structure

The backend of the project is organized using FastAPI and SQLAlchemy for the ORM. JWT authentication is used for secure access to the API.

```
api/                        
|-- auth/                   # Handles user authentication
|   |-- auth.py             # JWT authentication and token validation logic
|
|-- crud/                   # CRUD operations for various entities
|   |-- admin_statistic_crud.py       # Handles statistics for admins
|   |-- chat_crud.py                  # Manages chat functionality
|   |-- courier_crud.py               # Courier-related CRUD operations
|   |-- courier_report_crud.py        # Generates reports for couriers
|   |-- courier_statistic_crud.py     # Provides statistics for couriers
|   |-- couriers_crud.py              # Handles courier creation and management
|   |-- customer_crud.py              # Handles customer-related operations
|   |-- deliver_order_crud.py         # Manages order delivery by couriers
|   |-- delivered_orders_crud.py      # Retrieves delivered orders for couriers
|   |-- delivery_zone_crud.py         # Manages delivery zones for restaurants
|   |-- item_crud.py                  # Manages menu items for restaurants
|   |-- menu_crud.py                  # Manages menu categories for restaurants
|   |-- notifications_crud.py         # Handles notifications for users
|   |-- order_crud.py                 # Manages order creation and status updates
|   |-- order_history.py              # Retrieves customer order history
|   |-- orders_crud.py                # Handles order-related operations
|   |-- owner_crud.py                 # Handles restaurant owner-related operations
|   |-- owner_report_crud.py          # Generates reports for restaurant owners
|   |-- owner_statistic_crud.py       # Provides statistics for restaurant owners
|   |-- pending_crud.py               # Manages pending orders for restaurant owners
|   |-- rating_crud.py                # Manages customer ratings and updates restaurant ratings
|   |-- request_crud.py               # Handles user requests (e.g., registration, join requests)
|   |-- restaurant_crud.py            # Manages restaurant-related operations
|   |-- status_crud.py                # Manages courier status updates
|   |-- system.py                     # System-wide order and courier management logic
|   |-- top_restaurants_crud.py       # Retrieves top-rated restaurants
|   |-- track_orders_crud.py          # Manages order tracking for customers
|   |-- user_crud.py                  # Handles user-related operations
|
|-- database/               # Database connection and session management
|   |-- database.py         # Configures SQLAlchemy database connection
|
|-- models/                 # Database models (SQLAlchemy)
|   |-- models.py           # Defines models like User, Restaurant, Order, Courier, etc.
|
|-- schemas/                # Pydantic schemas for request/response validation
|   |-- schemas.py          # Schemas for Users, Restaurants, Orders, etc.
|
|-- utils/                  # Utility functions and helpers
|   |-- card_utils.py               # Card payment validation utilities
|   |-- change_utils.py             # Calculates optimal change for cash payments
|   |-- delivery_utils.py           # Checks if a location is within a delivery zone
|   |-- distance_utils.py           # Calculates distances and travel times
|   |-- email_templates_utils.py    # Generates email templates
|   |-- email_utils.py              # Handles email sending functionality
|   |-- owner_report.html           # HTML template for generating owner reports
|   |-- courier_report.html         # HTML template for generating courier reports
|   |-- password_utils.py           # Handles password hashing and verification
|   |-- rating_utils.py             # Calculates average restaurant ratings
|   |-- scheduled_tasks_utils.py    # Scheduled tasks for automated processes (e.g., sending reminder emails)
|
|-- main.py                 # Main entry point for the FastAPI application
|-- .env                    # Environment variables for backend configuration
```

### Frontend Structure

The frontend is built using React, offering a user-friendly interface with role-based access. The application supports dark mode and multi-language functionality.

```
app/                                # Main frontend project folder
|-- node_modules/                   # Node.js modules (auto-generated)
|
|-- public/                         # Public assets and static files
|   |-- images/                     # Images used throughout the app
|   |   |-- become_partner.jpg      # Image for becoming a partner
|   |   |-- bih.png                 # Bosnia and Herzegovina flag
|   |   |-- cities.png              # City-related images
|   |   |-- deliver_with_us.jpg     # Image for courier partnership
|   |   |-- join_team.jpg           # Team joining image
|   |   |-- logo.png                # App logo
|   |   |-- usa.png                 # USA flag
|   |   |-- who_are_we.jpg          # Introduction image
|   |-- index.html                  # Main HTML file
|   |-- manifest.json               # Metadata for the web app
|   |-- robots.txt                  # Instructions for web crawlers
|
|-- src/                            # Source files for the React frontend
|   |-- components/                 # React components folder
|   |   |-- AddCategoryRestaurant/  # Component to add restaurant categories
|   |   |-- AddItemRestaurant/      # Component to add items to the restaurant menu
|   |   |-- Admin/                  # Admin-related components (management UI)
|   |   |-- AdminStatistic/         # Admin statistics components
|   |   |-- Basket/                 # Basket (shopping cart) component
|   |   |-- Captcha/                # Captcha verification component
|   |   |-- Chat/                   # Chat functionality components
|   |   |-- ConfirmDelete/          # Confirmation for deleting items or actions
|   |   |-- Courier/                # Courier-related components
|   |   |-- Couriers/               # List of couriers
|   |   |-- CourierStatistic/       # Courier statistics components
|   |   |-- Customer/               # Customer-related components
|   |   |-- CustomerRestaurant/     # Component for displaying restaurants to customers
|   |   |-- DeliveredOrders/        # Delivered orders management component
|   |   |-- DeliverOrder/           # Component for couriers to manage current deliveries
|   |   |-- DeliveryZones/          # Component for managing delivery zones
|   |   |-- EditCategoryRestaurant/ # Component for editing restaurant categories
|   |   |-- EditItemRestaurant/     # Component for editing restaurant menu items
|   |   |-- EditRestaurant/         # Component for editing restaurant details
|   |   |-- Footer/                 # Footer component for the application
|   |   |-- ForgotPassword/         # Forgot password functionality
|   |   |-- FormPopup/              # Popup for forms (e.g., login, signup)
|   |   |-- Gallery/                # Gallery component for displaying images
|   |   |-- GoTop/                  # "Go to top" button component
|   |   |-- HamburgerMenu/          # Hamburger menu for navigation on smaller screens
|   |   |-- Header/                 # Header component
|   |   |-- ItemCard/               # Card component for displaying items
|   |   |-- LandingPage/            # Landing page component
|   |   |-- Language/               # Language selection component
|   |   |-- Loading/                # Loading spinner component
|   |   |-- LoginRegister/          # Login and registration forms
|   |   |-- Logout/                 # Logout component
|   |   |-- LookupTable/            # Lookup table component
|   |   |-- Map/                    # Map component for displaying delivery zones
|   |   |-- NotFound/               # Component for 404 errors (page not found)
|   |   |-- Notification/           # Notifications component
|   |   |-- Order/                  # Order management component
|   |   |-- OrderHistory/           # Order history for customers
|   |   |-- Orders/                 # List of orders (admin and owner views)
|   |   |-- Owner/                  # Owner-related components
|   |   |-- OwnerStatistic/         # Owner statistics components
|   |   |-- PendingOrders/          # Component for managing pending orders
|   |   |-- Profile/                # Profile management component
|   |   |-- Rating/                 # Rating component (for restaurants and couriers)
|   |   |-- Requests/               # Component for managing user requests
|   |   |-- ResetPassword/          # Reset password functionality
|   |   |-- Restaurant/             # Restaurant component (owner view)
|   |   |-- Restaurants/            # List of restaurants (admin view)
|   |   |-- SearchBar/              # Search bar component
|   |   |-- Status/                 # Component to display courier or order status
|   |   |-- Theme/                  # Component for managing theme (dark/light mode)
|   |   |-- TopRestaurants/         # Displays top-rated restaurants
|   |   |-- TrackOrders/            # Component for customers to track orders
|   |   |-- Unauthorized/           # Component for unauthorized access
|   |   |-- Users/                  # User management component (admin view)
|   |   |-- index.js                # This file centralizes and exports all React components, simplifying imports across the app
|   |   |-- ProtectedRoute.js       # Route protection based on user roles
|-- locales/                        # Localization files for i18n
|   |-- en/                         # English translations
|   |-- bs/                         # Bosnian translations
|
|-- App.js                          # Main application component
|-- App.css                         # Global styles for the app
|-- BasketContext.js                # Context for managing shopping basket
|-- i18n.js                         # Internationalization setup for the app
|-- index.js                        # Entry point for the React application           
```

## Pre-required Installation

1) Python (3.9 or higher) - https://www.python.org/downloads/
2) Node.js (16.0.0 or higher) - https://nodejs.org/en/download/package-manager

## Libraries and Third-Party Plugins

The following libraries and tools are used in this project:

1) FastAPI (0.95.1) - Web framework for the backend API
2) SQLAlchemy (1.4.39) - ORM for database management
3) Pydantic (1.8.2) - Data validation and settings management
4) PyJWT (2.1.0) - JSON Web Tokens for secure authentication
5) aiosmtplib (1.1.2) - Asynchronous SMTP client for email sending
6) bcrypt (3.2.0) - Password hashing library
7) React (18.0.0) - JavaScript library for building user interfaces
8) react-router-dom (6.2.1) - Routing library for React
9) i18next (20.3.2) - Internationalization framework
10) axios (0.21.1) - HTTP client for API calls

## How to Start the Application

### Backend Setup

1) Clone the repository:
```
git clone https://github.com/your-username/food-express.git
cd food-express
```
2) Navigate to the backend folder and install dependencies:
```
cd api
pip install -r requirements.txt
```
3) Run the FastAPI server:
```
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

### Frontend Setup
1) Navigate to the frontend folder:
```
cd app
```
2) Install the dependencies:
```
npm install
```
3) Run the frontend development server:
```
npm start
```

The app will be available at http://localhost:3000

## Features

1) Customer Features:
- Browse restaurants and menus
- Place and track orders
- Rate restaurants and couriers
- View order history
2) Restaurant Owner Features:
- Manage restaurant details and menu items
- View and manage orders
3) Courier Features:
- Deliver orders
- Track deliveries
- View delivery history
4) Administrator Features:
- Manage requests, delivery zones, users, couriers, and restaurant owners
- View system statistics
5) Other Features:
- Dark Mode: The app supports a dark theme toggle
- Multi-language Support: The app supports both English and Bosnian
- Email Notifications: Customers, couriers, and owners receive email notifications
- JWT Authentication: Secure access to the application using JWT tokens
- Real-time WebSocket Connections: For chat and order updates
