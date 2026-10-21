// /**
//  * ============================================================
//  * SEED — Demo data
//  * ============================================================
//  * Creates:
//  *   - 1 customer (customer@foodie.com / password123)
//  *   - 1 admin (admin@foodie.com / password123)
//  *   - 2 addresses for customer
//  *
//  * Run: node seed.js
//  * Safe to run repeatedly — clears first.
//  * ============================================================
//  */

// import "dotenv/config";
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import User from "./src/models/User.js";
// import Address from "./src/models/Address.js";

// const seed = async () => {
//   try {
//     console.log("🔌 Connecting...");
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ Connected to MongoDB");

//     // Clear
//     console.log("\n🧹 Clearing existing data...");
//     await Promise.all([User.deleteMany({}), Address.deleteMany({})]);
//     console.log("✅ Cleared");

//     // Hash password
//     const hash = await bcrypt.hash("password123", 12);

//     // Create users
//     console.log("\n👥 Creating users...");
//     const [customer, admin] = await User.insertMany([
//       {
//         name: "Demo Customer",
//         email: "customer@foodie.com",
//         phone: "9876543210",
//         password: hash,
//         role: "customer",
//       },
//       {
//         name: "Admin User",
//         email: "admin@foodie.com",
//         phone: "9876543211",
//         password: hash,
//         role: "admin",
//       },
//     ]);
//     console.log(`✅ Created customer: ${customer.email}`);
//     console.log(`✅ Created admin: ${admin.email}`);

//     // Create addresses for customer
//     console.log("\n🏠 Creating addresses...");
//     await Address.insertMany([
//       {
//         user: customer._id,
//         label: "Home",
//         line1: "123 MG Road",
//         line2: "Near Metro Station",
//         city: "Bangalore",
//         pincode: "560001",
//         isDefault: true,
//       },
//       {
//         user: customer._id,
//         label: "Work",
//         line1: "456 Church Street",
//         line2: "Tech Park, Tower B",
//         city: "Bangalore",
//         pincode: "560002",
//         isDefault: false,
//       },
//     ]);
//     console.log("✅ Created 2 addresses for Demo Customer");

//     console.log("\n═══════════════════════════════════════════");
//     console.log("🎉 SEED COMPLETE");
//     console.log("═══════════════════════════════════════════");
//     console.log("🔑 Login Credentials (password: password123)");
//     console.log("");
//     console.log("   👤 Customer:");
//     console.log("      Email: customer@foodie.com");
//     console.log("      Pass:  password123");
//     console.log("");
//     console.log("   👑 Admin:");
//     console.log("      Email: admin@foodie.com");
//     console.log("      Pass:  password123");
//     console.log("═══════════════════════════════════════════\n");

//     await mongoose.disconnect();
//     process.exit(0);
//   } catch (err) {
//     console.error("\n❌ Seed error:", err);
//     await mongoose.disconnect();
//     process.exit(1);
//   }
// };

// seed();

/**
 * ============================================================
 * SEED SCRIPT — Restaurants + Menu Items + Users + Addresses
 * ============================================================
 * Usage: npm run seed
 * ============================================================
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";
import Address from "./src/models/Address.js";
import Restaurant from "./src/models/Restaurant.js";
import MenuItem from "./src/models/MenuItem.js";

/* ============================================================
   SEED DATA — 6 Restaurants with full menus
   ============================================================ */

const RESTAURANTS = [
  {
    name: "Paradise Biryani",
    description:
      "Legendary Hyderabadi biryani since 1953. Slow-cooked dum biryani, kebabs, and traditional Mughlai food.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
    cuisines: ["Biryani", "North Indian", "Mughlai"],
    category: "Biryani",
    rating: 4.5,
    reviews: "12.4K",
    deliveryTime: 35,
    priceForTwo: 500,
    address: {
      line1: "MG Road",
      city: "Bangalore",
      pincode: "560001",
    },
    tags: ["Bestseller", "Pure Non-Veg"],
    isActive: true,
    isFeatured: true,
    offers: ["50% OFF up to ₹100", "Free Delivery"],
    menu: [
      {
        name: "Hyderabadi Chicken Biryani",
        price: 349,
        mrp: 399,
        isVeg: false,
        category: "Biryani",
        isBestseller: true,
        description:
          "Slow-cooked basmati rice with tender chicken, saffron, and traditional spices. Served with raita.",
      },
      {
        name: "Mutton Dum Biryani",
        price: 449,
        mrp: 499,
        isVeg: false,
        category: "Biryani",
        isBestseller: true,
        description:
          "Premium mutton biryani layered with fried onions and slow-cooked in a sealed pot.",
      },
      {
        name: "Veg Dum Biryani",
        price: 279,
        mrp: 329,
        isVeg: true,
        category: "Biryani",
        description:
          "Aromatic basmati rice with fresh vegetables and whole spices.",
      },
      {
        name: "Chicken 65",
        price: 249,
        isVeg: false,
        category: "Starters",
        description:
          "Spicy deep-fried chicken with curry leaves and red chilies.",
      },
      {
        name: "Mutton Kebab Platter",
        price: 389,
        isVeg: false,
        category: "Starters",
        description: "Assorted seekh, shami, and galouti kebabs.",
      },
      {
        name: "Double Ka Meetha",
        price: 149,
        isVeg: true,
        category: "Desserts",
        description:
          "Traditional Hyderabadi bread pudding with saffron and dry fruits.",
      },
      {
        name: "Apricot Delight",
        price: 129,
        isVeg: true,
        category: "Desserts",
        description: "Chilled apricot dessert with cream and nuts.",
      },
    ],
  },
  {
    name: "Pizza Hut",
    description:
      "The world's favorite pizza place. Hand-tossed pizzas, cheesy garlic bread, and pastas.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    cuisines: ["Pizza", "Italian", "Fast Food"],
    category: "Pizza",
    rating: 4.2,
    reviews: "8.9K",
    deliveryTime: 25,
    priceForTwo: 600,
    address: {
      line1: "Indiranagar",
      city: "Bangalore",
      pincode: "560038",
    },
    tags: ["Popular", "Family Friendly"],
    isActive: true,
    isFeatured: true,
    offers: ["Buy 1 Get 1 Free", "30% OFF"],
    menu: [
      {
        name: "Margherita Pizza",
        price: 279,
        mrp: 329,
        isVeg: true,
        category: "Pizza",
        isBestseller: true,
        description:
          "Classic delight with 100% real mozzarella cheese and tomato sauce.",
      },
      {
        name: "Peppy Paneer Pizza",
        price: 379,
        isVeg: true,
        category: "Pizza",
        description:
          "Paneer, crispy capsicum, and red paprika over mozzarella.",
      },
      {
        name: "Chicken Tikka Pizza",
        price: 429,
        isVeg: false,
        category: "Pizza",
        isBestseller: true,
        description:
          "Spiced chicken tikka, onions, and capsicum with a tandoori drizzle.",
      },
      {
        name: "Pepper Barbecue Chicken Pizza",
        price: 449,
        isVeg: false,
        category: "Pizza",
        description:
          "BBQ chicken chunks with onions and a sweet barbecue sauce.",
      },
      {
        name: "Cheesy Garlic Bread",
        price: 149,
        isVeg: true,
        category: "Sides",
        description: "Garlic bread sticks loaded with cheese and herbs.",
      },
      {
        name: "Chicken Wings (6 pc)",
        price: 249,
        isVeg: false,
        category: "Sides",
        description: "Spicy grilled chicken wings with hot sauce.",
      },
      {
        name: "Pasta Alfredo",
        price: 279,
        isVeg: true,
        category: "Pasta",
        description: "Creamy white sauce pasta with mushrooms and herbs.",
      },
      {
        name: "Choco Lava Cake",
        price: 109,
        isVeg: true,
        category: "Desserts",
        isBestseller: true,
        description: "Warm chocolate cake with molten chocolate center.",
      },
    ],
  },
  {
    name: "Mainland China",
    description:
      "Authentic Pan-Asian cuisine. Dim sums, wok-tossed noodles, and signature mains.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
    cuisines: ["Chinese", "Asian", "Thai"],
    category: "Chinese",
    rating: 4.4,
    reviews: "6.2K",
    deliveryTime: 40,
    priceForTwo: 900,
    address: {
      line1: "Koramangala",
      city: "Bangalore",
      pincode: "560034",
    },
    tags: ["Premium", "Date Night"],
    isActive: true,
    isFeatured: false,
    offers: ["20% OFF on orders above ₹799"],
    menu: [
      {
        name: "Chicken Dim Sums (6 pc)",
        price: 349,
        isVeg: false,
        category: "Starters",
        isBestseller: true,
        description:
          "Steamed dumplings with minced chicken and water chestnuts.",
      },
      {
        name: "Veg Momos (8 pc)",
        price: 249,
        isVeg: true,
        category: "Starters",
        description:
          "Steamed momos stuffed with cabbage, carrots, and mushrooms.",
      },
      {
        name: "Crispy Corn Chilli Pepper",
        price: 279,
        isVeg: true,
        category: "Starters",
        description: "Golden fried corn tossed with chili and curry leaves.",
      },
      {
        name: "Hakka Noodles",
        price: 259,
        isVeg: true,
        category: "Noodles",
        description: "Wok-tossed noodles with julienned vegetables.",
      },
      {
        name: "Chicken Fried Rice",
        price: 319,
        isVeg: false,
        category: "Rice",
        isBestseller: true,
        description:
          "Fragrant fried rice with egg, chicken, and spring onions.",
      },
      {
        name: "Chicken Manchurian",
        price: 349,
        isVeg: false,
        category: "Mains",
        description: "Crispy chicken balls in tangy Manchurian sauce.",
      },
      {
        name: "Thai Green Curry",
        price: 399,
        isVeg: true,
        category: "Mains",
        description: "Fragrant coconut curry with vegetables and Thai basil.",
      },
      {
        name: "Darsaan",
        price: 199,
        isVeg: true,
        category: "Desserts",
        description: "Crispy honey noodles with vanilla ice cream.",
      },
    ],
  },
  {
    name: "Burger King",
    description:
      "Flame-grilled burgers, crispy fries, and thick shakes. Have it your way.",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800",
    cuisines: ["Burgers", "Fast Food", "American"],
    category: "Burger",
    rating: 4.1,
    reviews: "15.7K",
    deliveryTime: 20,
    priceForTwo: 400,
    address: {
      line1: "Forum Mall",
      city: "Bangalore",
      pincode: "560095",
    },
    tags: ["Fast Delivery", "Value"],
    isActive: true,
    isFeatured: true,
    offers: ["60% OFF up to ₹120", "Free Fries"],
    menu: [
      {
        name: "Whopper",
        price: 199,
        mrp: 249,
        isVeg: false,
        category: "Burgers",
        isBestseller: true,
        description:
          "Flame-grilled beef patty with tomatoes, lettuce, mayo, and ketchup.",
      },
      {
        name: "Veg Whopper",
        price: 179,
        isVeg: true,
        category: "Burgers",
        description: "Crispy veg patty with fresh veggies and signature sauce.",
      },
      {
        name: "Chicken Crispy Burger",
        price: 169,
        isVeg: false,
        category: "Burgers",
        isBestseller: true,
        description: "Crispy chicken fillet, lettuce, and creamy mayo.",
      },
      {
        name: "Paneer King Burger",
        price: 189,
        isVeg: true,
        category: "Burgers",
        description: "Spicy paneer patty with mint mayo and onions.",
      },
      {
        name: "Chicken Fries (8 pc)",
        price: 149,
        isVeg: false,
        category: "Sides",
        description: "Crispy chicken fries with dipping sauce.",
      },
      {
        name: "King Fries (Large)",
        price: 129,
        isVeg: true,
        category: "Sides",
        isBestseller: true,
        description: "Crispy golden fries with sea salt.",
      },
      {
        name: "Chocolate Thick Shake",
        price: 179,
        isVeg: true,
        category: "Beverages",
        description: "Creamy chocolate shake topped with whipped cream.",
      },
      {
        name: "Chicken Nuggets (6 pc)",
        price: 149,
        isVeg: false,
        category: "Sides",
        description: "Tender chicken nuggets with BBQ dip.",
      },
    ],
  },
  {
    name: "Saravana Bhavan",
    description:
      "Authentic South Indian vegetarian food since 1968. Idli, dosa, and thalis.",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
    cuisines: ["South Indian", "Vegetarian", "Breakfast"],
    category: "South Indian",
    rating: 4.6,
    reviews: "9.1K",
    deliveryTime: 30,
    priceForTwo: 300,
    address: {
      line1: "Jayanagar",
      city: "Bangalore",
      pincode: "560041",
    },
    tags: ["Pure Veg", "Family"],
    isActive: true,
    isFeatured: true,
    offers: ["Free Filter Coffee"],
    isVeg: true,
    menu: [
      {
        name: "Ghee Roast Dosa",
        price: 149,
        isVeg: true,
        category: "Dosa",
        isBestseller: true,
        description:
          "Crispy dosa roasted in pure ghee, served with sambar and chutneys.",
      },
      {
        name: "Masala Dosa",
        price: 119,
        isVeg: true,
        category: "Dosa",
        isBestseller: true,
        description: "Classic dosa with spiced potato filling.",
      },
      {
        name: "Idli Vada Combo",
        price: 89,
        isVeg: true,
        category: "Idli",
        description: "2 steamed idlis and 1 medu vada with sambar and chutney.",
      },
      {
        name: "Rava Dosa",
        price: 139,
        isVeg: true,
        category: "Dosa",
        description: "Crispy semolina dosa with onions and green chilies.",
      },
      {
        name: "South Indian Thali",
        price: 249,
        isVeg: true,
        category: "Thali",
        isBestseller: true,
        description:
          "Unlimited rice, sambar, rasam, 4 curries, papad, and dessert.",
      },
      {
        name: "Curd Rice",
        price: 99,
        isVeg: true,
        category: "Rice",
        description:
          "Cooling curd rice with tempered mustard seeds and curry leaves.",
      },
      {
        name: "Filter Coffee",
        price: 49,
        isVeg: true,
        category: "Beverages",
        description:
          "Traditional South Indian filter coffee in a steel tumbler.",
      },
      {
        name: "Rava Kesari",
        price: 79,
        isVeg: true,
        category: "Desserts",
        description: "Sweet semolina dessert with ghee and cashews.",
      },
    ],
  },
  {
    name: "Wow! Momo",
    description:
      "India's favorite momo chain. Steamed, fried, and pan-fried momos with spicy chutneys.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800",
    cuisines: ["Momos", "Tibetan", "Asian"],
    category: "Momos",
    rating: 4.3,
    reviews: "11.2K",
    deliveryTime: 25,
    priceForTwo: 350,
    address: {
      line1: "BTM Layout",
      city: "Bangalore",
      pincode: "560076",
    },
    tags: ["Trending", "Late Night"],
    isActive: true,
    isFeatured: false,
    offers: ["Buy 2 Get 1 Free"],
    menu: [
      {
        name: "Steamed Chicken Momos (8 pc)",
        price: 199,
        isVeg: false,
        category: "Steamed Momos",
        isBestseller: true,
        description:
          "Juicy chicken momos steamed to perfection, served with spicy red chutney.",
      },
      {
        name: "Steamed Veg Momos (8 pc)",
        price: 149,
        isVeg: true,
        category: "Steamed Momos",
        isBestseller: true,
        description: "Classic cabbage and carrot momos with schezwan chutney.",
      },
      {
        name: "Pan-Fried Chicken Momos (6 pc)",
        price: 249,
        isVeg: false,
        category: "Pan-Fried",
        description:
          "Crispy bottom, juicy top — chicken momos pan-fried with hot oil.",
      },
      {
        name: "Fried Paneer Momos (6 pc)",
        price: 229,
        isVeg: true,
        category: "Fried",
        description: "Golden fried momos stuffed with spiced paneer.",
      },
      {
        name: "Chicken Momo Burger",
        price: 179,
        isVeg: false,
        category: "Momo Burger",
        description:
          "A momo in a bun? Yes! Crispy chicken momo patty with veggies.",
      },
      {
        name: "Cheese Corn Momos (8 pc)",
        price: 199,
        isVeg: true,
        category: "Steamed Momos",
        description: "Creamy cheese and sweet corn stuffed momos.",
      },
      {
        name: "Thukpa Noodle Soup",
        price: 219,
        isVeg: false,
        category: "Soups",
        description: "Tibetan noodle soup with chicken, vegetables, and broth.",
      },
      {
        name: "Honey Chilli Potato",
        price: 179,
        isVeg: true,
        category: "Sides",
        isBestseller: true,
        description: "Crispy potato fingers tossed in sweet and spicy sauce.",
      },
    ],
  },
];

/* ============================================================
   MAIN SEED FUNCTION
   ============================================================ */

const seed = async () => {
  try {
    console.log("\n🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    /* ---------- Clear ---------- */
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Address.deleteMany({}),
      Restaurant.deleteMany({}),
      MenuItem.deleteMany({}),
    ]);
    console.log("✅ Cleared\n");

    /* ---------- Users ---------- */
    console.log("👥 Creating users...");
    const hash = await bcrypt.hash("password123", 12);

    const [customer, admin] = await User.insertMany([
      {
        name: "Demo Customer",
        email: "customer@foodie.com",
        phone: "9876543210",
        password: hash,
        role: "customer",
      },
      {
        name: "Admin User",
        email: "admin@foodie.com",
        phone: "9876543211",
        password: hash,
        role: "admin",
      },
    ]);
    console.log(`✅ Customer: ${customer.email}`);
    console.log(`✅ Admin:    ${admin.email}\n`);

    /* ---------- Addresses ---------- */
    console.log("🏠 Creating addresses...");
    await Address.insertMany([
      {
        user: customer._id,
        label: "Home",
        line1: "123 MG Road",
        line2: "Near Metro Station",
        city: "Bangalore",
        pincode: "560001",
        isDefault: true,
      },
      {
        user: customer._id,
        label: "Work",
        line1: "456 Church Street",
        line2: "Tech Park, Tower B",
        city: "Bangalore",
        pincode: "560002",
      },
    ]);
    console.log("✅ 2 addresses created\n");

    /* ---------- Restaurants + Menus ---------- */
    console.log("🍽️  Creating restaurants + menus...\n");

    let totalItems = 0;

    for (const r of RESTAURANTS) {
      const { menu, ...restaurantData } = r;

      const restaurant = await Restaurant.create(restaurantData);

      const items = menu.map((item) => ({
        ...item,
        restaurant: restaurant._id,
        image:
          item.image ||
          `https://source.unsplash.com/400x300/?${encodeURIComponent(
            item.name,
          )}`,
      }));

      await MenuItem.insertMany(items);
      totalItems += items.length;

      console.log(`   ✅ ${restaurant.name} — ${items.length} items`);
    }

    console.log(
      `\n✅ ${RESTAURANTS.length} restaurants, ${totalItems} menu items\n`,
    );

    /* ---------- Done ---------- */
    console.log("═══════════════════════════════════════════");
    console.log("🎉 SEED COMPLETE");
    console.log("═══════════════════════════════════════════");
    console.log("🔑 Login Credentials (password: password123)");
    console.log("");
    console.log("   👤 Customer: customer@foodie.com");
    console.log("   👑 Admin:    admin@foodie.com");
    console.log("");
    console.log(`   🍽️  ${RESTAURANTS.length} restaurants`);
    console.log(`   🍕 ${totalItems} menu items`);
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
