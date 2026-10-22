/**
 * ============================================================
 * MASTER SEED SCRIPT — 100 Items per Collection
 * ============================================================
 * Run: node seedMaster.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const IMAGES = [
  "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
  "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
];

const AREAS = [
  "Koramangala",
  "Indiranagar",
  "HSR Layout",
  "Jayanagar",
  "Whitefield",
  "MG Road",
];
const CUISINES = [
  "Biryani",
  "Pizza",
  "Burger",
  "Chinese",
  "South Indian",
  "Desserts",
  "North Indian",
];

// ✅ Helper to safely import models only if they exist
const safeImport = async (modelName) => {
  const filePath = path.resolve(process.cwd(), `src/models/${modelName}.js`);
  if (fs.existsSync(filePath)) {
    const module = await import(`./src/models/${modelName}.js`);
    return module.default;
  }
  console.warn(`⚠️ Model ${modelName}.js not found. Skipping.`);
  return null;
};

const seedDatabase = async () => {
  try {
    console.log("✅ Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);

    // Dynamically load available models
    const User = await safeImport("User");
    const Restaurant = await safeImport("Restaurant");
    const MenuItem = await safeImport("MenuItem");
    const Order = await safeImport("Order");
    const Address = await safeImport("Address");
    const Coupon = await safeImport("Coupon");
    const Review = await safeImport("Review");
    const Favorite = await safeImport("Favorite");
    const SupportTicket = await safeImport("SupportTicket");
    const Setting = await safeImport("Setting");
    const Banner = await safeImport("Banner");
    const Newsletter = await safeImport("Newsletter");
    const Contact = await safeImport("Contact");

    console.log("🧹 Wiping existing data...");
    const modelsToWipe = [
      User,
      Restaurant,
      MenuItem,
      Order,
      Address,
      Coupon,
      Review,
      Favorite,
      SupportTicket,
      Setting,
      Banner,
      Newsletter,
      Contact,
    ].filter(Boolean);
    await Promise.all(modelsToWipe.map((m) => m.deleteMany({})));

    console.log("🚀 Starting master seed...\n");

    // 1. USERS (100)
    let users = [],
      customers = [];
    if (User) {
      console.log("👥 Seeding 100 Users...");
      const hashedPassword = await bcrypt.hash("password123", 12);
      const usersData = [];
      for (let i = 0; i < 100; i++) {
        usersData.push({
          name: i === 0 ? "Admin User" : `Customer ${i}`,
          email: i === 0 ? "admin@foodie.com" : `customer${i}@example.com`,
          password: hashedPassword,
          phone: `98765${String(i).padStart(5, "0")}`,
          role: i === 0 ? "admin" : "customer",
        });
      }
      users = await User.insertMany(usersData);
      customers = users.filter((u) => u.role === "customer");
    }

    // 2. RESTAURANTS (100)
    let restaurants = [];
    if (Restaurant) {
      console.log("🍽️ Seeding 100 Restaurants...");
      const restaurantsData = [];
      for (let i = 0; i < 100; i++) {
        restaurantsData.push({
          name: `Bangalore Spice ${i + 1}`,
          description: `Authentic flavors from ${random(AREAS)}.`,
          image: random(IMAGES),
          cuisines: [random(CUISINES)],
          address: {
            line1: `${i + 1} Main Rd`,
            city: "Bangalore",
            pincode: "560001",
          },
          phone: `0804123${String(i).padStart(4, "0")}`,
          rating: (Math.random() * 2 + 3).toFixed(1),
          reviewCount: randomInt(10, 500),
          deliveryTime: randomInt(20, 45),
          priceForTwo: randomInt(200, 1000),
          isActive: true,
        });
      }
      restaurants = await Restaurant.insertMany(restaurantsData);
    }

    // 3. MENU ITEMS (100)
    let menuItems = [];
    if (MenuItem && restaurants.length > 0) {
      console.log("🍕 Seeding 100 Menu Items...");
      const itemsData = [];
      for (let i = 0; i < 100; i++) {
        itemsData.push({
          restaurant: random(restaurants)._id,
          name: `Dish ${i + 1}`,
          description: "Delicious food prepared with fresh ingredients.",
          image: random(IMAGES),
          price: randomInt(100, 500),
          category: random(CUISINES),
          isVeg: Math.random() > 0.5,
          isAvailable: true,
        });
      }
      menuItems = await MenuItem.insertMany(itemsData);
    }

    // 4. ORDERS (100)
    let orders = [];
    if (Order && menuItems.length > 0 && customers.length > 0) {
      console.log("📦 Seeding 100 Orders...");
      const statuses = [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];
      const ordersData = [];
      for (let i = 0; i < 100; i++) {
        const item = random(menuItems);
        const qty = randomInt(1, 3);
        const subtotal = item.price * qty;
        const tax = Math.round(subtotal * 0.05);
        const deliveryFee = 30;
        const total = subtotal + tax + deliveryFee;

        ordersData.push({
          user: random(customers)._id,
          restaurant: item.restaurant,
          items: [
            {
              mealId: item._id,
              name: item.name,
              price: item.price,
              quantity: qty,
              image: item.image,
            },
          ],
          subtotal,
          tax,
          deliveryFee,
          total,
          address: {
            label: "Home",
            line1: "123 Test St",
            city: "Bangalore",
            pincode: "560001",
          },
          phone: "9876543210",
          paymentMethod: "cod",
          paymentStatus: "pending",
          status: random(statuses),
        });
      }
      orders = await Order.insertMany(ordersData);
    }

    // 5. ADDRESSES (100)
    if (Address && customers.length > 0) {
      console.log("📍 Seeding 100 Addresses...");
      const addressesData = [];
      for (let i = 0; i < 100; i++) {
        addressesData.push({
          user: random(customers)._id,
          label: "Home",
          line1: `${i + 1} Test Street`,
          city: "Bangalore",
          pincode: "560001",
          isDefault: true,
        });
      }
      await Address.insertMany(addressesData);
    }

    // 6. COUPONS (100)
    if (Coupon) {
      console.log("🎟️ Seeding 100 Coupons...");
      const couponsData = [];
      for (let i = 0; i < 100; i++) {
        couponsData.push({
          code: `SAVE${i + 10}`,
          discountType: "percentage",
          discountValue: 10,
          minOrderValue: 200,
          maxDiscount: 100,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        });
      }
      await Coupon.insertMany(couponsData);
    }

    // 7. REVIEWS (100)
    if (Review && customers.length > 0 && restaurants.length > 0) {
      console.log("⭐ Seeding 100 Reviews...");
      const reviewsData = [];
      for (let i = 0; i < 100; i++) {
        reviewsData.push({
          user: random(customers)._id,
          restaurant: random(restaurants)._id,
          order: orders.length > 0 ? random(orders)._id : null,
          rating: randomInt(3, 5),
          comment: "Great food, highly recommended!",
        });
      }
      await Review.insertMany(reviewsData);
    }

    // 8. FAVORITES (100)
    if (Favorite && customers.length > 0 && restaurants.length > 0) {
      console.log("❤️ Seeding 100 Favorites...");
      const favoritesData = [];
      for (let i = 0; i < 100; i++) {
        favoritesData.push({
          user: random(customers)._id,
          restaurant: random(restaurants)._id,
        });
      }
      await Favorite.insertMany(favoritesData);
    }

    // 9. SUPPORT TICKETS (100)
    if (SupportTicket && customers.length > 0) {
      console.log("🎧 Seeding 100 Support Tickets...");
      const ticketsData = [];
      for (let i = 0; i < 100; i++) {
        const user = random(customers);
        ticketsData.push({
          user: user._id,
          ticketNumber: `TKT-${String(i + 1).padStart(5, "0")}`,
          category: "delivery",
          subject: `Issue with order ${i + 1}`,
          description: "My food arrived cold.",
          status: random(["open", "in_progress", "resolved", "closed"]),
          messages: [
            {
              sender: "user",
              senderId: user._id,
              message: "My food arrived cold.",
            },
          ],
        });
      }
      await SupportTicket.insertMany(ticketsData);
    }

    // 10. SETTINGS (100)
    if (Setting) {
      console.log("⚙️ Seeding 100 Settings...");
      const settingsData = [];
      for (let i = 0; i < 100; i++) {
        settingsData.push({
          isStoreOpen: true,
          deliveryFee: 30,
          taxRate: 5,
          minOrderValue: 100,
          freeDeliveryThreshold: 500,
          packagingFee: 10,
        });
      }
      await Setting.insertMany(settingsData);
    }

    // 11. BANNERS (100)
    if (Banner) {
      console.log("🖼️ Seeding 100 Banners...");
      const bannersData = [];
      for (let i = 0; i < 100; i++) {
        bannersData.push({
          title: `Offer ${i + 1}`,
          subtitle: "Get 50% off on your first order",
          image: random(IMAGES),
          link: "/offers",
          isActive: i < 10,
        });
      }
      await Banner.insertMany(bannersData);
    }

    // 12. NEWSLETTERS (100)
    if (Newsletter) {
      console.log("📧 Seeding 100 Newsletters...");
      const newslettersData = [];
      for (let i = 0; i < 100; i++) {
        newslettersData.push({
          email: `subscriber${i + 1}@example.com`,
          source: "footer",
        });
      }
      await Newsletter.insertMany(newslettersData);
    }

    // 13. CONTACTS (100)
    if (Contact) {
      console.log("📞 Seeding 100 Contacts...");
      const contactsData = [];
      for (let i = 0; i < 100; i++) {
        contactsData.push({
          name: `User ${i + 1}`,
          email: `contact${i + 1}@example.com`,
          subject: "Inquiry",
          message: "I need help with my account.",
        });
      }
      await Contact.insertMany(contactsData);
    }

    console.log("\n🎉 MASTER SEED COMPLETE!");
    console.log("-----------------------------------------");
    if (users.length) console.log(`✅ ${users.length} Users`);
    if (restaurants.length) console.log(`✅ ${restaurants.length} Restaurants`);
    if (menuItems.length) console.log(`✅ ${menuItems.length} Menu Items`);
    if (orders.length) console.log(`✅ ${orders.length} Orders`);
    console.log("-----------------------------------------");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ SEED ERROR:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
