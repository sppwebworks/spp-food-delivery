# FoodieApp — Architecture

## Overview
FoodieApp is a modern, scalable food delivery platform built as a monorepo containing three distinct applications. It uses a decoupled architecture where the frontend and admin panel are separate React applications sharing a single Express backend.

| App | Tech Stack | Port (Dev) | Purpose |
|---|---|---|---|
| **Customer Client** | React 19, Redux Toolkit, Vite | 5173 | Public-facing app for ordering food |
| **Admin Panel** | React 19, Redux Toolkit, Vite | 5174 | Internal dashboard for managing orders, menus, and users |
| **Backend API** | Node.js, Express, MongoDB, Socket.IO | 5000 | REST API, Database, and Real-time WebSocket server |

---

## High-Level System Diagram

```text
               [ Customer (React) ]          [ Admin (React) ]
                    (Port 5173)                   (Port 5174)
                        │                             │
                        │  HTTP / REST                │  HTTP / REST
                        │  WebSocket (Socket.IO)      │
                        ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        EXPRESS BACKEND                          │
│                          (Port 5000)                            │
│                                                                 │
│  [ Auth Middleware ]  [ Admin Middleware ]  [ Rate Limiter ]    │
│                                                                 │
│  Controllers:                                                   │
│   - Auth          - Restaurants      - Admin Orders             │
│   - Cart/Orders   - Payments         - Admin Menus              │
│   - Users         - Newsletter       - File Uploads             │
└─────────────────────────────────────────────────────────────────┘
                        │                             │
                        ▼                             ▼
             [ MongoDB Database ]            [ Nodemailer (SMTP) ]
                 (Mongoose)                    (Email Service)


Frontend Architecture (Client & Admin)
Both frontend applications share the same architectural patterns, though their UI and features differ.

1. Routing (React Router v7)
Both apps use react-router-dom for client-side routing.

Client App: Features public routes (/, /restaurants/:id) and private routes (/checkout, /profile). Private routes are wrapped in a <PrivateRoute> component that redirects unauthenticated users to /login.

Admin App: Features a single public route (/admin/login) and all other routes are wrapped in <ProtectedAdmin>, which checks if user.role === 'admin'.

2. State Management (Redux Toolkit + Context API)
We use a hybrid approach for state:

Redux (Global Server State):

auth: User session, JWT token, login/register status.

cart: Items, subtotal, delivery fee, and total.

restaurants: Restaurant list, menu items, search results, item details.

orders: User's order history and current order tracking.

React Context (Global UI State):

ThemeContext: Light/Dark mode toggle.

ToastContext: Global notification system (success/error messages).

LocationContext: User's selected city and delivery area.

Local State (useState):

Used for isolated UI concerns: modal open/close state, form inputs, mobile menu toggle.

3. Component Structure

src/
├── app/          # Redux store configuration
├── components/   # Reusable UI components (dumb/presentational)
│   ├── layout/   # Navbar, Footer
│   ├── home/     # Hero, OfferBanner, CategoryStrip
│   ├── restaurant/ # RestaurantCard, FilterSidebar
│   └── common/   # Modal, SearchAutocomplete, Skeleton
├── context/      # React Context providers
├── features/     # Redux slices (thunks + reducers)
├── pages/        # Route entry points (smart/connected to Redux)
├── services/     # Axios API client, Socket.IO setup
└── utils/        # Formatting helpers, constants

Backend Architecture
1. Layer Separation
The backend strictly follows a layered architecture:

Routes (/routes): Defines HTTP endpoints and binds them to middleware and controllers.

Middleware (/middleware): Handles cross-cutting concerns (JWT verification, error handling, image upload parsing).

Controllers (/controllers): Contains business logic. Validates request bodies, interacts with models, and sends responses.

Models (/models): Mongoose schemas that define the shape of the data and handle database interactions.

Config (/config): Setup for DB connection, Socket.IO, and Nodemailer.

2. Authentication & Authorization (JWT)
Client posts credentials to /api/auth/login.

Backend verifies password via bcrypt.

Backend generates a JWT containing the user's ID.

Client stores the JWT in localStorage (Client app uses token, Admin app uses admin_token).

Every subsequent request sends Authorization: Bearer <token>.

The protect middleware verifies the token and attaches req.user to the request.

The adminOnly middleware checks if req.user.role === 'admin' for admin routes.

3. Order & Payment Flow
Cart to Order: User checks out. Client sends order details to POST /api/orders. Order is created with status: "pending".

Payment Initiation:

If COD, order stays pending.

If online, client calls POST /api/payments/initiate. Backend returns a mock gateway URL/session.

Payment Verification: Client calls POST /api/payments/verify after gateway success. Backend updates order to status: "confirmed" and paymentStatus: "paid".

Fulfillment: Admin updates the order status via PUT /api/admin/orders/:id/status.

Real-Time Updates: Whenever status changes, the backend emits a Socket.IO event to the user's private room (user:{userId}).

Real-Time Architecture (Socket.IO)
The backend runs a Socket.IO server alongside Express on the same port (5000).

Authentication: Clients connect and pass their JWT in the handshake (auth: { token }).

Rooms: Upon connection, the socket joins a room named user:{userId}.

Events Emitted by Server:

order:status: When an admin updates an order status, the customer receives this event and updates their tracker in real-time without refreshing.

Database Schema (MongoDB)
User
name, email (unique), password (hashed), role (customer | admin).

Indexes: email (unique).

Restaurant
name, description, image, cuisines (Array of Strings), address (Object), rating, deliveryTime, isActive, isFeatured.

Indexes: name (text), cuisines (text), address.city.

MenuItem
restaurant (ObjectId ref), name, description, price, mrp, category, isVeg, isAvailable, isRecommended.

Indexes: restaurant, category.

Order
user (ObjectId ref), items (Array of Objects), subtotal, deliveryFee, tax, total, status, paymentMethod, paymentStatus, address, phone.

Indexes: user, status, createdAt.

Subscriber (Newsletter)
email (unique), isActive, source.

Indexes: email.

Security Practices
Passwords: Hashed with bcrypt (12 rounds).

JWTs: HS256 signed, 7-day expiry.

Headers: helmet for HTTP security headers.

CORS: Strict whitelist for CLIENT_URL and ADMIN_URL.

Rate Limiting: express-rate-limit protects against brute-force and DDoS.

Sanitization: Middleware strips $ and . from request bodies to prevent NoSQL injection.

File Uploads: Restricted to image MIME types and a 5MB size limit.

Scalability & Future Improvements
File Storage: Currently saving images to local /uploads. Will migrate to AWS S3 or Cloudinary for horizontal scaling.

Caching: Add Redis for caching frequent restaurant searches and category lists.

Real-time Scaling: If deploying multiple Express instances, we will add socket.io-redis adapter to share WebSocket events across nodes.

Email Queue: Move email sending to a background queue (BullMQ) so SMTP timeouts don't block HTTP requests.