# SPP FoodieApp — Deployment Guide

This guide walks you through deploying the complete SPP FoodieApp platform. The project is a monorepo with three parts that need to be deployed separately:
1. **Customer Client** (`/client`) — React SPA
2. **Admin Panel** (`/admin`) — React SPA
3. **Backend API** (`/server`) — Node.js Express Server

We will use **Vercel** for the frontends, **Render** for the backend, and **MongoDB Atlas** for the database.

---

## Prerequisites
- A [GitHub](https://github.com) account with your project pushed to a repository.
- Accounts on [Vercel](https://vercel.com) (Frontend), [Render](https://render.com) (Backend), and [MongoDB Atlas](https://mongodb.com/atlas) (Database).
- A Gmail account (for sending newsletter emails) with 2-Factor Authentication enabled.

---

## Step 1 — Database Setup (MongoDB Atlas)

1. Sign in to **MongoDB Atlas** and create a new **M0 (Free) Cluster**.
2. Under **Security → Database Access**, create a database user (e.g., `admin` / `password123`).
3. Under **Security → Network Access**, add IP address `0.0.0.0/0` (Allow access from anywhere). *Note: For production, restrict this to Render's IPs.*
4. Click **Connect** → **Connect your application** → Select **Node.js**.
5. Copy the connection string. It looks like:
   `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/foodiehub?retryWrites=true&w=majority`
   *(Replace `<password>` with your actual password).*

---

## Step 2 — Email Setup (Gmail App Password)

Since the app sends welcome emails on newsletter subscription, you need an SMTP provider. We will use Gmail.

1. Go to your Google Account → **Security**.
2. Ensure **2-Step Verification** is turned ON.
3. Search for **App Passwords** in the Google Account search bar.
4. Create a new app password (name it "SPP FoodieApp").
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`). You will need this for the backend environment variables.

---

## Step 3 — Backend Deployment (Render)

1. Log in to **Render** and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name:** `foodie-backend`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Scroll down to **Environment Variables** and add the following:
   ```env
   NODE_ENV=production
   PORT=10000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_64_character_random_string_here
   JWT_EXPIRES_IN=7d
   
   # Add these AFTER you deploy Vercel (Step 4 & 5)
   CLIENT_URL=https://your-client-app.vercel.app
   ADMIN_URL=https://your-admin-app.vercel.app
   
   # Email Config
   EMAIL_DEV_MODE=false
   EMAIL_FROM=SPP FoodieApp <your_email@gmail.com>
   ADMIN_EMAIL=your_email@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_char_app_password

   Click Create Web Service.

Wait for deployment. Copy the Render URL (e.g., https://foodie-backend.onrender.com).

(Note: Render's free tier spins down after 15 minutes of inactivity. The first request will take ~50 seconds to wake up.)

Step 4 — Customer Client Deployment (Vercel)
Log in to Vercel and click Add New → Project.

Import your GitHub repository.

Configure the project:

Framework Preset: Vite

Root Directory: client

Build Command: npm run build

Output Directory: dist

Expand Environment Variables and add:

Key: VITE_API_URL

Value: https://foodie-backend.onrender.com/api (Use your Render URL from Step 3)

Click Deploy.

Once deployed, copy the Vercel URL (e.g., https://foodie-client.vercel.app).

Step 5 — Admin Panel Deployment (Vercel)
In Vercel, click Add New → Project.

Import the same GitHub repository.

Configure the project:

Framework Preset: Vite

Root Directory: admin

Build Command: npm run build

Output Directory: dist

Expand Environment Variables and add:

Key: VITE_API_URL

Value: https://foodie-backend.onrender.com/api

Click Deploy.

Copy the Admin URL (e.g., https://foodie-admin.vercel.app).

Step 6 — Update CORS & Redeploy Backend
Now that you have both Vercel URLs, you must tell the backend to trust them.

Go back to Render → your Backend Web Service → Environment.

Update these two variables with your actual Vercel URLs:

CLIENT_URL=https://foodie-client.vercel.app

ADMIN_URL=https://foodie-admin.vercel.app

Save changes. Render will automatically trigger a redeploy.

Step 7 — Seed Production Database
To get your production app working with the demo restaurants, you need to seed the data.

Run this command in your local terminal (make sure you are in the server folder):

# Point your local script to the Atlas database
MONGO_URI="your_mongodb_atlas_connection_string" node src/seed/seedAll.js

(If you don't have a seedAll.js yet, you can run your local seedRestaurants.js while temporarily changing your .env to point to the Atlas URI, then change it back).

Default Admin Credentials Created:

Email: admin@foodie.com

Password: password123

Default Customer Credentials Created:

Email: customer@foodie.com

Password: password123

Step 8 — Post-Deployment Checklist
Verify the deployment by checking each item:

□ Backend Health: Visit https://foodie-backend.onrender.com/api/health → should return {"status":"ok"}.
□ Customer App: Open the Vercel client URL. Restaurants should load.
□ Admin App: Open the Vercel admin URL. You should see the login screen.
□ Admin Login: Log in with admin@foodie.com. Verify the dashboard loads.
□ Database: Click "Restaurants" in the Admin panel. Verify the 8 seeded restaurants appear.
□ Order Flow: In the Customer app, add an item to cart, login, and place a COD order.
□ Real-time: Change the order status in the Admin panel. The Customer app should update instantly (if viewing the order details).
□ Newsletter: Scroll to the customer footer, enter your email, and click subscribe. Check your inbox (and spam folder) for the "Welcome to SPP FoodieApp" email.
Troubleshooting Common Errors
1. Network Error or CORS blocked
Cause: Backend CLIENT_URL or ADMIN_URL doesn't match the Vercel domains exactly.
Fix: Go to Render, update the URLs (no trailing slash!), and redeploy. Clear your browser cache.

2. Images uploading but disappearing
Cause: Render's filesystem is ephemeral. Any file saved to /uploads is lost when the server restarts.
Fix: You must use a cloud storage provider like Cloudinary or AWS S3 for production. (See the ARCHITECTURE.md scaling notes).

3. Newsletter Email Failed (self-signed certificate)
Cause: Render's network uses a proxy that breaks Nodemailer's strict TLS checks.
Fix: Ensure SMTP_ALLOW_SELF_SIGNED=true is NOT set in production if using a proper SMTP provider, but if you get TLS errors, switch to a service like Resend or SendGrid (HTTPS APIs avoid this issue completely).

4. Backend takes 50+ seconds to load
Cause: You are on Render's free tier, which spins down after 15 minutes of inactivity.
Fix: Upgrade to the $7/month Render plan to keep it always-on, or set up a cron job (like UptimeRobot) to ping /api/health every 14 minutes.

Custom Domains (Optional)
If you bought a domain (e.g., sppfoodieapp.com):

Client: In Vercel → Settings → Domains, add app.sppfoodieapp.com. Update your DNS with the CNAME provided.

Admin: In Vercel → Settings → Domains, add admin.sppfoodieapp.com. Update DNS.

Backend: In Render → Settings → Custom Domain, add api.sppfoodieapp.com. Update DNS.

Update Env Vars: Update CLIENT_URL, ADMIN_URL, and the VITE_API_URL (in both Vercel projects) to use the new custom domains. Redeploy everything.

Production Hardening Checklist
Before launching to real users, ensure:

□ Database network access in Atlas is restricted (not 0.0.0.0/0).
□ JWT Secret is a strong, 64-character random string.
□ Rate limiting is enabled (already implemented in app.js).
□ Helmet.js is enabled (already implemented).
□ Automated database backups are enabled in MongoDB Atlas.
□ Error tracking (Sentry) is configured for both backend and frontend.

