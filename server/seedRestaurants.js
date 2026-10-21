/**
 * ============================================================
 * SEED RESTAURANTS + MENU
 * ============================================================
 * Run: node seedRestaurants.js
 * Safe to re-run — clears existing restaurants + menu items.
 * ============================================================
 */

import "dotenv/config";
import mongoose from "mongoose";
import Restaurant from "./src/models/Restaurant.js";
import MenuItem from "./src/models/MenuItem.js";

const IMG = {
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  chinese: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
  dosa: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
  paneer: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
  thali: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  dessert: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
  icedtea: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=800",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
};

const RESTAURANTS = [
  {
    name: "Paradise Biryani",
    description:
      "Iconic Hyderabadi biryani since 1953. Aromatic basmati rice, slow-cooked with hand-ground spices.",
    image: IMG.biryani,
    cuisines: ["Biryani", "Hyderabadi", "Mughlai", "North Indian"],
    address: {
      line1: "12 MG Road",
      line2: "Near Metro Station",
      city: "Bangalore",
      pincode: "560001",
    },
    phone: "08041234567",
    rating: 4.6,
    reviewCount: 2150,
    deliveryTime: 35,
    priceForTwo: 550,
    offer: "50% OFF up to ₹100",
    isVeg: false,
    isFeatured: true,
    menu: [
      {
        name: "Chicken Dum Biryani",
        category: "Biryani",
        price: 349,
        mrp: 399,
        isVeg: false,
        isRecommended: true,
        image: IMG.biryani,
        description:
          "Slow-cooked Hyderabadi-style biryani with tender chicken and saffron",
      },
      {
        name: "Mutton Dum Biryani",
        category: "Biryani",
        price: 449,
        mrp: 499,
        isVeg: false,
        image: IMG.biryani,
        description: "Rich, aromatic mutton biryani with hand-ground spices",
      },
      {
        name: "Veg Dum Biryani",
        category: "Biryani",
        price: 279,
        mrp: 329,
        isVeg: true,
        image: IMG.biryani,
        description: "Fragrant basmati rice layered with seasonal vegetables",
      },
      {
        name: "Egg Biryani",
        category: "Biryani",
        price: 249,
        mrp: 299,
        isVeg: false,
        image: IMG.biryani,
        description: "Boiled eggs simmered in spiced rice",
      },
      {
        name: "Chicken 65",
        category: "Starters",
        price: 289,
        isVeg: false,
        image: IMG.paneer,
        description: "Spicy, deep-fried chicken tossed with curry leaves",
      },
      {
        name: "Paneer Tikka",
        category: "Starters",
        price: 259,
        isVeg: true,
        isRecommended: true,
        image: IMG.paneer,
        description: "Marinated cottage cheese grilled in tandoor",
      },
      {
        name: "Apollo Fish",
        category: "Starters",
        price: 319,
        isVeg: false,
        image: IMG.paneer,
        description: "Boneless fish fried crisp and tossed in spicy masala",
      },
      {
        name: "Butter Naan",
        category: "Breads",
        price: 59,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Garlic Naan",
        category: "Breads",
        price: 79,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Tandoori Roti",
        category: "Breads",
        price: 45,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Double Ka Meetha",
        category: "Desserts",
        price: 149,
        isVeg: true,
        image: IMG.dessert,
      },
      {
        name: "Qubani Ka Meetha",
        category: "Desserts",
        price: 169,
        isVeg: true,
        isRecommended: true,
        image: IMG.dessert,
        description: "Traditional Hyderabadi apricot dessert",
      },
      {
        name: "Sweet Lassi",
        category: "Beverages",
        price: 89,
        isVeg: true,
        image: IMG.icedtea,
      },
      {
        name: "Masala Chai",
        category: "Beverages",
        price: 49,
        isVeg: true,
        image: IMG.coffee,
      },
    ],
  },
  {
    name: "Pizza Palace",
    description:
      "Wood-fired pizzas with San Marzano tomatoes, fresh mozzarella, and a crispy thin crust.",
    image: IMG.pizza,
    cuisines: ["Pizza", "Italian", "Fast Food"],
    address: {
      line1: "45 Church Street",
      line2: "Brigade Road",
      city: "Bangalore",
      pincode: "560002",
    },
    phone: "08042345678",
    rating: 4.4,
    reviewCount: 1820,
    deliveryTime: 25,
    priceForTwo: 500,
    offer: "Buy 1 Get 1 Free",
    isVeg: false,
    menu: [
      {
        name: "Margherita Pizza",
        category: "Pizzas",
        price: 249,
        mrp: 299,
        isVeg: true,
        isRecommended: true,
        image: IMG.pizza,
        description: "Classic tomato, basil, and mozzarella",
      },
      {
        name: "Pepperoni Pizza",
        category: "Pizzas",
        price: 399,
        isVeg: false,
        isRecommended: true,
        image: IMG.pizza,
        description: "Loaded with spicy pepperoni",
      },
      {
        name: "Farmhouse Pizza",
        category: "Pizzas",
        price: 349,
        isVeg: true,
        image: IMG.pizza,
        description: "Onion, capsicum, mushroom, tomato, sweet corn",
      },
      {
        name: "BBQ Chicken Pizza",
        category: "Pizzas",
        price: 429,
        isVeg: false,
        image: IMG.pizza,
        description: "BBQ chicken with red onion and jalapeños",
      },
      {
        name: "Paneer Tikka Pizza",
        category: "Pizzas",
        price: 379,
        isVeg: true,
        image: IMG.pizza,
        description: "Marinated paneer, bell peppers, and mint mayo",
      },
      {
        name: "Garlic Breadsticks",
        category: "Sides",
        price: 149,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Cheesy Garlic Bread",
        category: "Sides",
        price: 179,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Chicken Wings (6pc)",
        category: "Sides",
        price: 289,
        isVeg: false,
        image: IMG.burger,
      },
      {
        name: "Alfredo Pasta",
        category: "Pastas",
        price: 299,
        isVeg: true,
        image: IMG.pizza,
        description: "Creamy white sauce with herbs",
      },
      {
        name: "Arrabbiata Pasta",
        category: "Pastas",
        price: 289,
        isVeg: true,
        image: IMG.pizza,
        description: "Spicy tomato sauce with garlic",
      },
      {
        name: "Coke (500ml)",
        category: "Beverages",
        price: 79,
        isVeg: true,
        image: IMG.icedtea,
      },
      {
        name: "Iced Tea",
        category: "Beverages",
        price: 99,
        isVeg: true,
        image: IMG.icedtea,
      },
    ],
  },
  {
    name: "Burger Barn",
    description:
      "Handcrafted burgers with grass-fed beef, brioche buns, and hand-cut fries.",
    image: IMG.burger,
    cuisines: ["Burgers", "American", "Fast Food"],
    address: {
      line1: "78 Indiranagar 100ft Road",
      city: "Bangalore",
      pincode: "560038",
    },
    phone: "08043456789",
    rating: 4.5,
    reviewCount: 1450,
    deliveryTime: 22,
    priceForTwo: 450,
    offer: "20% OFF on orders above ₹500",
    isVeg: false,
    isFeatured: true,
    menu: [
      {
        name: "Classic Cheeseburger",
        category: "Burgers",
        price: 249,
        isVeg: false,
        isRecommended: true,
        image: IMG.burger,
        description: "Beef patty, cheddar, lettuce, tomato, house sauce",
      },
      {
        name: "Bacon Burger",
        category: "Burgers",
        price: 329,
        isVeg: false,
        image: IMG.burger,
        description: "Double bacon, smoked cheddar, caramelized onions",
      },
      {
        name: "Veggie Burger",
        category: "Burgers",
        price: 199,
        isVeg: true,
        image: IMG.burger,
        description: "Crispy veg patty with chipotle mayo",
      },
      {
        name: "Paneer Burger",
        category: "Burgers",
        price: 229,
        isVeg: true,
        image: IMG.burger,
        description: "Grilled paneer, mint chutney, lettuce",
      },
      {
        name: "Chicken Zinger",
        category: "Burgers",
        price: 279,
        isVeg: false,
        isRecommended: true,
        image: IMG.burger,
      },
      {
        name: "Classic Fries",
        category: "Sides",
        price: 99,
        isVeg: true,
        image: IMG.burger,
      },
      {
        name: "Cheese Fries",
        category: "Sides",
        price: 149,
        isVeg: true,
        image: IMG.burger,
      },
      {
        name: "Onion Rings",
        category: "Sides",
        price: 129,
        isVeg: true,
        image: IMG.burger,
      },
      {
        name: "Chocolate Shake",
        category: "Beverages",
        price: 149,
        isVeg: true,
        image: IMG.dessert,
      },
      {
        name: "Strawberry Shake",
        category: "Beverages",
        price: 149,
        isVeg: true,
        image: IMG.dessert,
      },
    ],
  },
  {
    name: "Wok & Roll",
    description:
      "Authentic Indo-Chinese street food — Hakka noodles, Manchurian, and stir-fries.",
    image: IMG.chinese,
    cuisines: ["Chinese", "Indo-Chinese", "Asian"],
    address: {
      line1: "23 Koramangala 5th Block",
      city: "Bangalore",
      pincode: "560095",
    },
    phone: "08044567890",
    rating: 4.3,
    reviewCount: 980,
    deliveryTime: 28,
    priceForTwo: 400,
    isVeg: false,
    menu: [
      {
        name: "Veg Hakka Noodles",
        category: "Noodles",
        price: 199,
        isVeg: true,
        isRecommended: true,
        image: IMG.chinese,
      },
      {
        name: "Chicken Hakka Noodles",
        category: "Noodles",
        price: 249,
        isVeg: false,
        image: IMG.chinese,
      },
      {
        name: "Schezwan Noodles",
        category: "Noodles",
        price: 229,
        isVeg: true,
        image: IMG.chinese,
      },
      {
        name: "Veg Manchurian",
        category: "Starters",
        price: 189,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Gobi 65",
        category: "Starters",
        price: 199,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Chicken Lollipop (4pc)",
        category: "Starters",
        price: 279,
        isVeg: false,
        isRecommended: true,
        image: IMG.paneer,
      },
      {
        name: "Veg Fried Rice",
        category: "Rice",
        price: 189,
        isVeg: true,
        image: IMG.chinese,
      },
      {
        name: "Chicken Fried Rice",
        category: "Rice",
        price: 239,
        isVeg: false,
        image: IMG.chinese,
      },
      {
        name: "Schezwan Fried Rice",
        category: "Rice",
        price: 219,
        isVeg: true,
        image: IMG.chinese,
      },
      {
        name: "Hot & Sour Soup",
        category: "Soups",
        price: 129,
        isVeg: true,
        image: IMG.chinese,
      },
    ],
  },
  {
    name: "Dosa Junction",
    description:
      "Crispy dosas, fluffy idlis, and filter coffee — the way it's made in every South Indian home.",
    image: IMG.dosa,
    cuisines: ["South Indian", "Dosa", "Breakfast", "Vegetarian"],
    address: {
      line1: "56 Jayanagar 4th Block",
      city: "Bangalore",
      pincode: "560011",
    },
    phone: "08045678901",
    rating: 4.7,
    reviewCount: 2890,
    deliveryTime: 20,
    priceForTwo: 300,
    offer: "Flat ₹40 OFF",
    isVeg: true,
    isFeatured: true,
    menu: [
      {
        name: "Masala Dosa",
        category: "Dosas",
        price: 129,
        isVeg: true,
        isRecommended: true,
        image: IMG.dosa,
        description: "Crispy dosa with spiced potato filling",
      },
      {
        name: "Plain Dosa",
        category: "Dosas",
        price: 99,
        isVeg: true,
        image: IMG.dosa,
      },
      {
        name: "Ghee Roast",
        category: "Dosas",
        price: 159,
        isVeg: true,
        isRecommended: true,
        image: IMG.dosa,
        description: "Extra crispy dosa roasted in ghee",
      },
      {
        name: "Set Dosa",
        category: "Dosas",
        price: 119,
        isVeg: true,
        image: IMG.dosa,
      },
      {
        name: "Idli Vada Combo",
        category: "Tiffins",
        price: 99,
        isVeg: true,
        image: IMG.dosa,
      },
      {
        name: "Medu Vada",
        category: "Tiffins",
        price: 69,
        isVeg: true,
        image: IMG.dosa,
      },
      {
        name: "Upma",
        category: "Tiffins",
        price: 89,
        isVeg: true,
        image: IMG.dosa,
      },
      {
        name: "Pongal",
        category: "Tiffins",
        price: 109,
        isVeg: true,
        image: IMG.dosa,
      },
      {
        name: "Filter Coffee",
        category: "Beverages",
        price: 59,
        isVeg: true,
        isRecommended: true,
        image: IMG.coffee,
      },
      {
        name: "Masala Chai",
        category: "Beverages",
        price: 49,
        isVeg: true,
        image: IMG.coffee,
      },
    ],
  },
  {
    name: "Mainland Thali",
    description:
      "Authentic North Indian thalis — unlimited rotis, rich curries, and homemade desserts.",
    image: IMG.thali,
    cuisines: ["North Indian", "Thali", "Punjabi"],
    address: {
      line1: "89 Whitefield Main Road",
      city: "Bangalore",
      pincode: "560066",
    },
    phone: "08046789012",
    rating: 4.5,
    reviewCount: 1230,
    deliveryTime: 40,
    priceForTwo: 600,
    offer: "Free Gulab Jamun on ₹700+",
    isVeg: true,
    menu: [
      {
        name: "Veg Thali",
        category: "Thali",
        price: 349,
        isVeg: true,
        isRecommended: true,
        image: IMG.thali,
        description: "4 sabzis, dal, rice, 4 rotis, sweet, papad",
      },
      {
        name: "Paneer Thali",
        category: "Thali",
        price: 399,
        isVeg: true,
        image: IMG.thali,
        description: "Paneer curry, dal makhani, rice, 4 rotis, sweet",
      },
      {
        name: "Special Thali",
        category: "Thali",
        price: 449,
        isVeg: true,
        isRecommended: true,
        image: IMG.thali,
        description: "Paneer, kofta, dal, rice, 5 rotis, 2 sweets",
      },
      {
        name: "Paneer Butter Masala",
        category: "Curries",
        price: 289,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Dal Makhani",
        category: "Curries",
        price: 249,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Malai Kofta",
        category: "Curries",
        price: 299,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Butter Naan",
        category: "Breads",
        price: 59,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Laccha Paratha",
        category: "Breads",
        price: 79,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Gulab Jamun (2pc)",
        category: "Desserts",
        price: 99,
        isVeg: true,
        isRecommended: true,
        image: IMG.dessert,
      },
    ],
  },
  {
    name: "Tandoori Nights",
    description:
      "Slow-cooked kebabs, seekh platters, and clay-oven specialities.",
    image: IMG.paneer,
    cuisines: ["Kebabs", "Tandoori", "Mughlai"],
    address: {
      line1: "34 HSR Layout Sector 2",
      city: "Bangalore",
      pincode: "560102",
    },
    phone: "08047890123",
    rating: 4.4,
    reviewCount: 890,
    deliveryTime: 35,
    priceForTwo: 500,
    isVeg: false,
    menu: [
      {
        name: "Chicken Tikka",
        category: "Kebabs",
        price: 329,
        isVeg: false,
        isRecommended: true,
        image: IMG.paneer,
      },
      {
        name: "Seekh Kebab",
        category: "Kebabs",
        price: 349,
        isVeg: false,
        image: IMG.paneer,
      },
      {
        name: "Malai Tikka",
        category: "Kebabs",
        price: 359,
        isVeg: false,
        image: IMG.paneer,
      },
      {
        name: "Paneer Tikka",
        category: "Kebabs",
        price: 279,
        isVeg: true,
        isRecommended: true,
        image: IMG.paneer,
      },
      {
        name: "Tandoori Chicken (Half)",
        category: "Tandoori",
        price: 399,
        isVeg: false,
        isRecommended: true,
        image: IMG.paneer,
      },
      {
        name: "Tandoori Chicken (Full)",
        category: "Tandoori",
        price: 699,
        isVeg: false,
        image: IMG.paneer,
      },
      {
        name: "Butter Naan",
        category: "Breads",
        price: 59,
        isVeg: true,
        image: IMG.paneer,
      },
      {
        name: "Garlic Naan",
        category: "Breads",
        price: 79,
        isVeg: true,
        image: IMG.paneer,
      },
    ],
  },
  {
    name: "Sweet Tooth",
    description: "Artisan cakes, ice creams, and desserts — handcrafted daily.",
    image: IMG.cake,
    cuisines: ["Desserts", "Ice Cream", "Cakes", "Bakery"],
    address: { line1: "12 Lavelle Road", city: "Bangalore", pincode: "560001" },
    phone: "08048901234",
    rating: 4.8,
    reviewCount: 1560,
    deliveryTime: 25,
    priceForTwo: 350,
    offer: "20% OFF on all cakes",
    isVeg: true,
    isFeatured: true,
    menu: [
      {
        name: "Belgian Chocolate Cake (500g)",
        category: "Cakes",
        price: 749,
        mrp: 899,
        isVeg: true,
        isRecommended: true,
        image: IMG.cake,
      },
      {
        name: "Red Velvet Cake (500g)",
        category: "Cakes",
        price: 699,
        isVeg: true,
        image: IMG.cake,
      },
      {
        name: "Black Forest Cake (500g)",
        category: "Cakes",
        price: 599,
        isVeg: true,
        image: IMG.cake,
      },
      {
        name: "Cheesecake Slice",
        category: "Cakes",
        price: 249,
        isVeg: true,
        isRecommended: true,
        image: IMG.cake,
      },
      {
        name: "Vanilla Ice Cream (500ml)",
        category: "Ice Cream",
        price: 199,
        isVeg: true,
        image: IMG.dessert,
      },
      {
        name: "Chocolate Ice Cream (500ml)",
        category: "Ice Cream",
        price: 229,
        isVeg: true,
        image: IMG.dessert,
      },
      {
        name: "Butterscotch Ice Cream (500ml)",
        category: "Ice Cream",
        price: 229,
        isVeg: true,
        image: IMG.dessert,
      },
      {
        name: "Brownie (Single)",
        category: "Brownies",
        price: 129,
        isVeg: true,
        isRecommended: true,
        image: IMG.dessert,
      },
      {
        name: "Brownie with Ice Cream",
        category: "Brownies",
        price: 199,
        isVeg: true,
        image: IMG.dessert,
      },
      {
        name: "Tiramisu",
        category: "Desserts",
        price: 279,
        isVeg: true,
        image: IMG.dessert,
      },
      {
        name: "Gulab Jamun (4pc)",
        category: "Desserts",
        price: 149,
        isVeg: true,
        image: IMG.dessert,
      },
    ],
  },
];

const seed = async () => {
  try {
    console.log("\n╔══════════════════════════════════════╗");
    console.log("║  RESTAURANTS + MENU SEEDER           ║");
    console.log("╚══════════════════════════════════════╝\n");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    console.log("\n🧹 Clearing existing data...");
    await Promise.all([Restaurant.deleteMany({}), MenuItem.deleteMany({})]);
    console.log("✅ Cleared");

    console.log("\n🍽️  Creating restaurants...\n");
    let totalMenuItems = 0;

    for (const data of RESTAURANTS) {
      const { menu, ...restaurantData } = data;

      const restaurant = await Restaurant.create(restaurantData);
      console.log(`  ✅ ${restaurant.name} (ID: ${restaurant._id})`);

      const items = menu.map((item, idx) => ({
        restaurant: restaurant._id,
        name: item.name,
        description: item.description || "",
        image: item.image || restaurant.image,
        price: item.price,
        mrp: item.mrp || 0,
        category: item.category,
        isVeg: item.isVeg || false,
        isAvailable: true,
        isRecommended: item.isRecommended || false,
        order: idx,
      }));

      await MenuItem.insertMany(items);
      console.log(`     └─ ${items.length} menu items added\n`);
      totalMenuItems += items.length;
    }

    console.log("═══════════════════════════════════════════");
    console.log("🎉 SEED COMPLETE");
    console.log("═══════════════════════════════════════════");
    console.log(`   ${RESTAURANTS.length} restaurants created`);
    console.log(`   ${totalMenuItems} menu items created`);
    console.log("═══════════════════════════════════════════\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seed error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
