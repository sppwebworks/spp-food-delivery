/**
 * ============================================================
 * BANGALORE SEED SCRIPT — 100 Restaurants + Menus
 * ============================================================
 * Run: node seedBangalore.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import Restaurant from "./src/models/Restaurant.js";
import MenuItem from "./src/models/MenuItem.js";

// Real Unsplash images for variety
const IMAGES = {
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  chinese: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80",
  dosa: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80",
  northIndian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  dessert: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
};

// Real Bangalore locations
const AREAS = ["Koramangala", "Indiranagar", "HSR Layout", "Jayanagar", "Whitefield", "MG Road", "Jayanagar 4th Block", "Bellandur", "Marathahalli"];
const CITIES = ["Bangalore"];
const PINCODES = ["560001", "560034", "560095", "560041", "560066", "560038", "560102"];

// Cuisine Templates
const CUISINES = [
  { name: "Biryani", img: IMAGES.biryani, items: [
    { name: "Hyderabadi Chicken Dum Biryani", price: 349, isVeg: false, cat: "Biryani" },
    { name: "Mutton Dum Biryani", price: 449, isVeg: false, cat: "Biryani" },
    { name: "Veg Dum Biryani", price: 299, isVeg: true, cat: "Biryani" },
    { name: "Chicken 65", price: 249, isVeg: false, cat: "Starters" },
    { name: "Double Ka Meetha", price: 149, isVeg: true, cat: "Desserts" }
  ]},
  { name: "Pizza", img: IMAGES.pizza, items: [
    { name: "Margherita Pizza", price: 249, isVeg: true, cat: "Pizzas" },
    { name: "Pepperoni Pizza", price: 399, isVeg: false, cat: "Pizzas" },
    { name: "Garlic Breadsticks", price: 149, isVeg: true, cat: "Sides" },
    { name: "Alfredo Pasta", price: 299, isVeg: true, cat: "Pastas" },
    { name: "Choco Lava Cake", price: 99, isVeg: true, cat: "Desserts" }
  ]},
  { name: "Burger", img: IMAGES.burger, items: [
    { name: "Classic Veg Burger", price: 149, isVeg: true, cat: "Burgers" },
    { name: "Crispy Chicken Burger", price: 199, isVeg: false, cat: "Burgers" },
    { name: "Peri Peri Fries", price: 129, isVeg: true, cat: "Sides" },
    { name: "Chocolate Milkshake", price: 149, isVeg: true, cat: "Beverages" }
  ]},
  { name: "Chinese", img: IMAGES.chinese, items: [
    { name: "Veg Hakka Noodles", price: 199, isVeg: true, cat: "Noodles" },
    { name: "Chicken Fried Rice", price: 249, isVeg: false, cat: "Rice" },
    { name: "Veg Manchurian Dry", price: 199, isVeg: true, cat: "Starters" },
    { name: "Spring Rolls", price: 149, isVeg: true, cat: "Starters" }
  ]},
  { name: "South Indian", img: IMAGES.dosa, items: [
    { name: "Masala Dosa", price: 120, isVeg: true, cat: "Dosas" },
    { name: "Ghee Podi Dosa", price: 150, isVeg: true, cat: "Dosas" },
    { name: "Idli Vada Combo", price: 90, isVeg: true, cat: "Tiffins" },
    { name: "Filter Coffee", price: 40, isVeg: true, cat: "Beverages" }
  ]},
  { name: "North Indian", img: IMAGES.northIndian, items: [
    { name: "Paneer Butter Masala", price: 280, isVeg: true, cat: "Curries" },
    { name: "Butter Chicken", price: 350, isVeg: false, cat: "Curries" },
    { name: "Butter Naan", price: 60, isVeg: true, cat: "Breads" },
    { name: "Dal Makhani", price: 250, isVeg: true, cat: "Curries" }
  ]},
  { name: "Desserts", img: IMAGES.dessert, items: [
    { name: "Belgian Chocolate Cake", price: 299, isVeg: true, cat: "Cakes" },
    { name: "Red Velvet Pastry", price: 149, isVeg: true, cat: "Pastries" },
    { name: "Vanilla Ice Cream", price: 99, isVeg: true, cat: "Ice Creams" }
  ]},
  { name: "Cafe", img: IMAGES.cafe, items: [
    { name: "Cappuccino", price: 180, isVeg: true, cat: "Coffee" },
    { name: "Club Sandwich", price: 220, isVeg: false, cat: "Sandwiches" },
    { name: "Blueberry Cheesecake", price: 250, isVeg: true, cat: "Desserts" }
  ]}
];

// Real Bangalore Restaurant Names (Mix of popular real ones and generic ones)
const RESTAURANT_NAMES = [
  "Truffles", "Meghana Foods", "Empire Restaurant", "CTR (Shri Sagar)", "Rameshwaram Cafe",
  "MTR", "Vidyarthi Bhavan", "Byg Brewski Brewing Company", "Toit Brewpub", "Windmills Craftworks",
  "Paradise Biryani", "Bawarchi", "Pizza Hut", "Domino's Pizza", "KFC", "McDonald's",
  "Burger King", "Leon Grill", "Arbor Brewing Company", "Big Brewsky", "The Black Pearl",
  "AB's Absolute Barbecues", "Barbeque Nation", "Spice Terrace", "Copper Chimney",
  "Mainland China", "Wok & Roll", "Noodle Theory", "Dosa Camp", "Kanti Sweets",
  "Anand Sweets", "Corner House Ice Creams", "Natural Ice Cream", "Third Wave Coffee",
  "Blue Tokai Coffee Roasters", "Starbucks", "Dyu Art Cafe", "Matteo Coorg", "The Humming Tree",
  "Blossom Book House Cafe", "Chai Point", "Third Wave Coffee", "Glen's Bakehouse", "Albert Bakery"
];
// We will multiply this list to reach 100 restaurants.
// Fill the rest with dynamic names.
const generateRestaurantNames = () => {
  const names = [...RESTAURANT_NAMES];
  for (let i = names.length; i < 100; i++) {
    names.push(`${names[i % RESTAURANT_NAMES.length]} - ${AREAS[i % AREAS.length]} Branch`);
  }
  return names;
};

const seed = async () => {
  try {
    console.log("✅ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("🧹 Clearing existing restaurants and menus...");
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});

    console.log("🍽️  Creating 100 Bangalore Restaurants and Menus...\n");

    const restaurantNames = generateRestaurantNames();

    for (let i = 0; i < 100; i++) {
      // Pick a random cuisine profile for this restaurant
      const cuisineProfile = CUISINES[i % CUISINES.length];
      const area = AREAS[i % AREAS.length];
      const pincode = PINCODES[i % PINCODES.length];

      // 1. Create the Restaurant
      const restaurant = await Restaurant.create({
        name: restaurantNames[i],
        description: `Experience the best of ${cuisineProfile.name} at ${restaurantNames[i]}.`,
        image: cuisineProfile.img,
        cuisines: [cuisineProfile.name, "North Indian"], // Give them a secondary tag
        address: {
          line1: `${Math.floor(Math.random() * 100) + 1} Main Road, ${area}`,
          city: "Bangalore",
          pincode: pincode,
        },
        phone: `080${Math.floor(40000000 + Math.random() * 9999999)}`,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 to 5.0
        reviewCount: Math.floor(Math.random() * 2000) + 50,
        deliveryTime: Math.floor(Math.random() * 20) + 20, // 20 to 40 mins
        priceForTwo: Math.floor(Math.random() * 800) + 300, // 300 to 1100
        offer: i % 3 === 0 ? "50% OFF up to ₹100" : "",
        isActive: true,
        isVeg: cuisineProfile.name === "South Indian" || cuisineProfile.name === "Desserts",
      });

      // 2. Map the menu items to this specific restaurant
      const items = cuisineProfile.items.map((item, idx) => ({
        restaurant: restaurant._id, // ✅ Linking to the specific restaurant
        name: item.name,
        description: `A delicious ${item.name} prepared with authentic spices.`,
        image: cuisineProfile.img, // Use the cuisine image for the dish
        price: item.price,
        mrp: item.price + 50, // Add a fake MRP for discount display
        category: item.cat,
        isVeg: item.isVeg,
        isAvailable: true,
        isRecommended: idx === 0, // Make the first item a "Recommended" dish
        order: idx,
      }));

      // 3. Insert the items
      await MenuItem.insertMany(items);

      console.log(`✅ ${restaurant.name} (${area}) — ${items.length} menu items.`);
    }

    console.log("\n🎉 SEED COMPLETE!");
    console.log("-----------------------------------------");
    console.log("   100 Bangalore Restaurants Created");
    console.log("   Menu Items Linked Automatically");
    console.log("-----------------------------------------");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seed error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();