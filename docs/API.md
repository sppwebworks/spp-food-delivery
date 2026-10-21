# FoodieApp — Complete API Reference

**Base URL (Local):** `http://localhost:5000/api`  
**Base URL (Production):** `https://api.yourdomain.com/api`

All endpoints return JSON. Authenticated routes require a valid JWT sent in the headers:
```http
Authorization: Bearer <your_jwt_token>



Table of Contents
Health Check

Authentication

Addresses

Restaurants (Public)

Orders (Customer)

Payments

Newsletter

File Upload

Admin — Auth

Admin — Orders

Admin — Restaurants & Menu

Admin — Users

Error Responses

🩺 Health Check
GET /api/health
Checks if the server is running. No authentication required.

Response 200 OK:

{
  "status": "ok",
  "env": "development",
  "timestamp": "2026-10-17T10:30:00.000Z"
}

🔐 Authentication
Routes for customer registration, login, and profile management.

POST /api/auth/register
Create a new customer account.

Request Body:{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123"
}
Response 201 Created:

{
  "_id": "665abc123...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "customer",
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
POST /api/auth/login
Authenticate a customer.

Request Body:
{
  "email": "john@example.com",
  "password": "password123"
}
Response 200 OK:


{
  "_id": "665abc123...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
GET /api/auth/me (Protected)
Get the current logged-in user's profile.

Response 200 OK:
{
  "_id": "665abc123...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "customer"
}

PUT /api/auth/me (Protected)
Update the current user's profile.

Request Body (all fields optional):
{
  "name": "Jane Doe",
  "phone": "9876543211",
  "password": "newsecurepassword"
}
Response 200 OK: (Returns updated user object + token)


🏠 Addresses
Manage the customer's delivery addresses. Requires Auth.

GET /api/addresses
List all addresses for the current user.

Response 200 OK:
[
  {
    "_id": "665addr1...",
    "label": "Home",
    "line1": "123 MG Road",
    "line2": "Near Metro Station",
    "city": "Bangalore",
    "pincode": "560001"
  }
]
POST /api/addresses
Create a new address.

Request Body:
{
  "label": "Work",
  "line1": "45 Church Street",
  "line2": "Brigade Road",
  "city": "Bangalore",
  "pincode": "560002"
}
Response 201 Created: (Returns the new address object)


DELETE /api/addresses/:id
Delete an address.

Response 200 OK:
{ "message": "Address removed" }
🍽️ Restaurants (Public)
Routes for browsing restaurants and menus. No authentication required.

GET /api/restaurants
List active restaurants with optional filtering and pagination.

Query Parameters:

Param	Type	Description
city	String	Filter by exact city (e.g. Bangalore)
area	String	Filter by neighborhood/street (searches line1 & line2)
cuisine	String	Filter by a specific cuisine (e.g. Biryani)
search	String	Text search on name, description, and cuisines
page	Number	Default: 1
limit	Number	Default: 50

{
  "restaurants": [
    {
      "_id": "665rest1...",
      "name": "Paradise Biryani",
      "image": "https://images.unsplash.com/...",
      "cuisines": ["Biryani", "Hyderabadi", "Mughlai"],
      "rating": 4.6,
      "reviewCount": 2150,
      "deliveryTime": 35,
      "priceForTwo": 550,
      "offer": "50% OFF up to ₹100",
      "isVeg": false,
      "isFeatured": true,
      "address": { "city": "Bangalore", "line1": "MG Road" }
    }
  ],
  "total": 9,
  "page": 1
}
GET /api/restaurants/areas?city=Bangalore
Retrieves a distinct list of areas for a given city to populate location dropdowns.

Query Parameters: city (required)

Response 200 OK:

{
  "city": "Bangalore",
  "areas": ["Indiranagar", "Koramangala", "MG Road", "Whitefield"]
}
GET /api/restaurants/:id
Get a single restaurant's details and its full menu grouped by category.

Response 200 OK:
{
  "restaurant": { ... }, 
  "menu": [ { "_id": "...", "name": "Chicken Biryani", "price": 349 } ],
  "grouped": {
    "Biryani": [ { "_id": "...", "name": "Chicken Biryani", "price": 349 } ],
    "Starters": [ ... ]
  }
}
GET /api/restaurants/:rid/items/:itemId
Get a single menu item, its parent restaurant, and 6 sibling items from the same category. Used for the Item Detail page.

Response 200 OK:
{
  "item": { "_id": "665item1...", "name": "Chicken Biryani", "price": 349, "mrp": 399 },
  "restaurant": { "_id": "665rest1...", "name": "Paradise Biryani", "rating": 4.6 },
  "siblings": [ ... ]
}
🛒 Orders (Customer)
Routes for placing and viewing orders. Requires Auth.

POST /api/orders
Create a new order.

Request Body:
{
  "items": [
    {
      "mealId": "665item1...",
      "name": "Chicken Biryani",
      "price": 349,
      "quantity": 2,
      "image": "https://..."
    }
  ],
  "subtotal": 698,
  "deliveryFee": 30,
  "tax": 35,
  "discount": 0,
  "total": 763,
  "address": {
    "label": "Home",
    "line1": "123 MG Road",
    "city": "Bangalore",
    "pincode": "560001"
  },
  "phone": "9876543210",
  "paymentMethod": "cod"
}
Response 201 Created: (Returns the complete Order object)


GET /api/orders
List all orders placed by the current user, sorted by newest first.

Response 200 OK: Array<Order>
GET /api/orders/:id
Get a single order's details.

Response 200 OK: Order object.


💳 Payments
Routes for interacting with payment gateways. Requires Auth.

POST /api/payments/initiate
Start a payment flow for an existing order.

Request Body:
{
  "orderId": "665order1...",
  "method": "stripe",
  "amount": 763
}Response 200 OK:

{
  "method": "stripe",
  "sessionId": "cs_test_12345",
  "redirectUrl": "https://checkout.stripe.com/...",
  "amount": 763,
  "currency": "inr"
}
POST /api/payments/verify
Verify payment after the gateway callback.

Request Body:
{
  "orderId": "665order1...",
  "paymentId": "pay_12345",
  "gateway": "stripe"
}
Response 200 OK:

{
  "success": true,
  "order": { "_id": "665order1...", "status": "confirmed", "paymentStatus": "paid" }
}
📧 Newsletter
Manage email subscriptions. Public.

POST /api/newsletter/subscribe
Subscribe an email address.

Request Body:
{
  "email": "user@example.com",
  "source": "footer"
}
Response 201 Created:

{
  "success": true,
  "message": "Thanks for subscribing! Check your inbox.",
  "subscriber": { "_id": "665sub1...", "email": "user@example.com" }
}
POST /api/newsletter/unsubscribe
Unsubscribe an email address.

Request Body: { "email": "user@example.com" }

Response 200 OK:
{ "success": true, "message": "You've been unsubscribed." }
📤 File Upload
Handle image uploads for menu items and restaurants. Requires Admin Auth.

POST /api/upload
Accepts a multipart/form-data request with a file field named image.

Form Data:

image: [File Object]

Response 200 OK:
{
  "url": "/uploads/1697123456-123456.jpg",
  "filename": "1697123456-123456.jpg",
  "size": 1048576,
  "mimetype": "image/jpeg"
}
🛡️ Admin — Auth
Admin-specific authentication routes.

POST /api/admin/login
Login as an admin. Rejects if user role is not "admin".

Request Body:
{
  "email": "admin@foodie.com",
  "password": "password123"
}Response 200 OK:


{
  "user": {
    "_id": "665admin1...",
    "name": "Admin User",
    "email": "admin@foodie.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
🛡️ Admin — Orders
Manage all system orders. Requires Admin Auth.

GET /api/admin/orders
List all orders across the platform.

Query Parameters:

Param	Type	Description
status	String	Filter by order status (pending, delivered, etc.)
page	Number	Default: 1
limit	Number	Default: 20
Response 200 OK:
{
  "orders": [ { "_id": "...", "user": { "name": "John" }, "total": 763, "status": "pending" } ],
  "total": 42,
  "page": 1,
  "pages": 3
}
GET /api/admin/orders/:id
Get a single order's full details (includes populated user data).

Response 200 OK: Order object.

PUT /api/admin/orders/:id/status
Update the status of an order. Emits a Socket.IO event to the customer.

Request Body:
{ "status": "out_for_delivery" }
Response 200 OK: (Returns updated Order object)


GET /api/admin/stats
Get dashboard KPI stats.

Response 200 OK:
{
  "totalOrders": 42,
  "totalUsers": 15,
  "totalRevenue": 25340,
  "byStatus": {
    "pending": 2,
    "confirmed": 5,
    "delivered": 30,
    "cancelled": 5
  }
}
🛡️ Admin — Restaurants & Menu
Manage catalog data. Requires Admin Auth.

GET /api/admin/restaurants
List ALL restaurants (including inactive), with item counts.
{
  "restaurants": [
    {
      "_id": "...",
      "name": "Paradise Biryani",
      "itemCount": 14,
      "isActive": true
    }
  ],
  "total": 9
}
POST /api/admin/restaurants
Create a new restaurant.

Request Body:
{
  "name": "New Restaurant",
  "description": "Description...",
  "image": "https://...",
  "cuisines": ["Indian", "Chinese"],
  "address": {
    "line1": "123 Main St",
    "city": "Mumbai",
    "pincode": "400001"
  },
  "rating": 4.5,
  "deliveryTime": 30,
  "priceForTwo": 500
}
Response 201 Created: Restaurant object.


PUT /api/admin/restaurants/:id
Update an existing restaurant. (Accepts partial updates).

Request Body: (Same as POST, all fields optional)
Response 200 OK: Restaurant object.

PUT /api/admin/restaurants/:id/toggle
Enable or disable a restaurant (isActive toggles).

Response 200 OK: Restaurant object.

DELETE /api/admin/restaurants/:id
Delete a restaurant AND cascade delete all its menu items.

Response 200 OK:

{ "message": "Restaurant and menu deleted", "_id": "..." }

POST /api/admin/restaurants/:id/items
Add a menu item to a specific restaurant.

Request Body:
{
  "name": "Chicken Biryani",
  "description": "Aromatic rice...",
  "image": "https://...",
  "price": 349,
  "mrp": 399,
  "category": "Biryani",
  "isVeg": false,
  "isRecommended": true
}

Response 201 Created: MenuItem object.


PUT /api/admin/items/:id
Update a menu item.

Request Body: (Same as POST, all fields optional)
Response 200 OK: MenuItem object.


PUT /api/admin/items/:id/toggle
Toggle a menu item's availability (isAvailable).

Response 200 OK: MenuItem object.

DELETE /api/admin/items/:id
Delete a menu item.

Response 200 OK: { "message": "Menu item deleted" }

🛡️ Admin — Users
Manage registered users. Requires Admin Auth.

GET /api/admin/users
List all registered users (passwords excluded).

Response 200 OK:

[
  {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer",
    "createdAt": "2026-10-17T10:30:00.000Z"
  }
]

🚦 Error Responses
All errors return a standard JSON object:
{
  "message": "Description of the error"
}

Common Status Codes:

Code	Meaning	Trigger
400	Bad Request	Missing or invalid body fields
401	Unauthorized	Missing/invalid JWT token
403	Forbidden	Logged in, but not an admin (where required)
404	Not Found	Invalid ID or resource deleted
429	Too Many Requests	Rate limit exceeded
500	Internal Server Error	Backend crash (check server logs)
(Note: In development NODE_ENV=development, the error object also includes a stack trace for debugging).

