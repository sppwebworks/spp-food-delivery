# 🍽️ FoodieApp - Full Stack Food Delivery Platform

A production-ready, real-time food delivery application built with the MERN stack.

## 🚀 Features
- **Customer App:** Browse restaurants, cart, checkout (Stripe/Razorpay/COD), live order tracking, favorites, and a real-time support chat.
- **Admin Panel:** Real-time order dashboard, restaurant/menu management, coupon engine, analytics charts, and a live support inbox.
- **Real-time:** Socket.IO for live order status updates and two-way support chat.
- **Payments:** Stripe Elements, Razorpay Popup, and PhonePe redirects.
- **Security:** JWT auth, bcrypt, rate limiting, Mongoose sanitization, and webhooks.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Redux Toolkit, React Router, Recharts.
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO.
- **Auth:** JWT
- **Payments:** Stripe, Razorpay, PhonePe

## 📦 Project Structure
- `/client` - Customer facing app (Port 5173)
- `/admin` - Admin dashboard (Port 5174)
- `/server` - Express backend & Socket.IO (Port 5000)

## ⚙️ Setup Instructions
1. Clone the repo: `git clone https://github.com/yourusername/food-delivery-app.git`
2. Install dependencies:
   ```bash
   cd client && npm install
   cd ../admin && npm install
   cd ../server && npm install