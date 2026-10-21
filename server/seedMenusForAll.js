import "dotenv/config";
import mongoose from "mongoose";
import Restaurant from "./src/models/Restaurant.js";
import MenuItem from "./src/models/MenuItem.js";

// A pool of items mapped by cuisine type
const menuPool = {
  Biryani: [
    {
      name: "Chicken Dum Biryani",
      price: 349,
      mrp: 399,
      desc: "Aromatic basmati rice layered with tender chicken and spices.",
      img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
      isVeg: false,
    },
    {
      name: "Mutton Biryani",
      price: 449,
      mrp: 499,
      desc: "Slow-cooked mutton with saffron and fried onions.",
      img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
      isVeg: false,
    },
    {
      name: "Veg Biryani",
      price: 249,
      mrp: 299,
      desc: "Fresh vegetables cooked with fragrant basmati rice.",
      img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
      isVeg: true,
    },
    {
      name: "Chicken 65",
      price: 289,
      mrp: 329,
      desc: "Spicy, deep-fried chicken tossed with curry leaves.",
      img: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=800",
      isVeg: false,
    },
  ],
  Pizza: [
    {
      name: "Margherita Pizza",
      price: 279,
      mrp: 329,
      desc: "Classic delight with 100% real mozzarella cheese.",
      img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
      isVeg: true,
    },
    {
      name: "Pepperoni Pizza",
      price: 399,
      mrp: 449,
      desc: "Loaded with spicy pepperoni and extra cheese.",
      img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
      isVeg: false,
    },
    {
      name: "Garlic Breadsticks",
      price: 129,
      mrp: 149,
      desc: "Baked to perfection with garlic and herbs.",
      img: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=800",
      isVeg: true,
    },
    {
      name: "Choco Lava Cake",
      price: 109,
      mrp: 129,
      desc: "Rich chocolate cake with a molten center.",
      img: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800",
      isVeg: true,
    },
  ],
  Burger: [
    {
      name: "Classic Cheeseburger",
      price: 199,
      mrp: 249,
      desc: "Juicy patty, cheese, lettuce, and our secret sauce.",
      img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
      isVeg: false,
    },
    {
      name: "Crispy Chicken Burger",
      price: 229,
      mrp: 279,
      desc: "Fried chicken fillet with mayo and jalapenos.",
      img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
      isVeg: false,
    },
    {
      name: "Veggie Burger",
      price: 169,
      mrp: 199,
      desc: "Crispy mixed veggie patty with fresh veggies.",
      img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
      isVeg: true,
    },
    {
      name: "French Fries",
      price: 99,
      mrp: 119,
      desc: "Golden, crispy fries sprinkled with sea salt.",
      img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800",
      isVeg: true,
    },
  ],
  "South Indian": [
    {
      name: "Masala Dosa",
      price: 149,
      mrp: 179,
      desc: "Crispy crepe filled with spiced potato masala.",
      img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
      isVeg: true,
    },
    {
      name: "Ghee Roast Dosa",
      price: 189,
      mrp: 219,
      desc: "Extra crispy dosa roasted in pure ghee.",
      img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
      isVeg: true,
    },
    {
      name: "Medu Vada (2 pc)",
      price: 99,
      mrp: 119,
      desc: "Crispy lentil doughnuts served with sambar.",
      img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
      isVeg: true,
    },
    {
      name: "Filter Coffee",
      price: 59,
      mrp: 79,
      desc: "Authentic South Indian filter coffee.",
      img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
      isVeg: true,
    },
  ],
  Chinese: [
    {
      name: "Chicken Hakka Noodles",
      price: 229,
      mrp: 269,
      desc: "Wok-tossed noodles with shredded chicken.",
      img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
      isVeg: false,
    },
    {
      name: "Veg Manchurian Gravy",
      price: 199,
      mrp: 239,
      desc: "Crispy veg balls in a spicy, tangy gravy.",
      img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
      isVeg: true,
    },
    {
      name: "Chilli Chicken",
      price: 279,
      mrp: 319,
      desc: "Spicy and crispy chicken tossed with peppers.",
      img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
      isVeg: false,
    },
    {
      name: "Veg Momos (6 pc)",
      price: 149,
      mrp: 179,
      desc: "Steamed dumplings served with spicy chutney.",
      img: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800",
      isVeg: true,
    },
  ],
  Desserts: [
    {
      name: "Death by Chocolate",
      price: 199,
      mrp: 249,
      desc: "Ice cream, brownie, chocolate sauce, and nuts.",
      img: "https://images.unsplash.com/photo-1563805042-7684c8e9e9cb?w=800",
      isVeg: true,
    },
    {
      name: "Red Velvet Cake",
      price: 149,
      mrp: 179,
      desc: "Classic red velvet with cream cheese frosting.",
      img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
      isVeg: true,
    },
    {
      name: "Hot Chocolate Brownie",
      price: 179,
      mrp: 199,
      desc: "Warm fudge brownie served with vanilla ice cream.",
      img: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800",
      isVeg: true,
    },
  ],
  "North Indian": [
    {
      name: "Paneer Butter Masala",
      price: 279,
      mrp: 329,
      desc: "Creamy tomato curry with soft paneer cubes.",
      img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
      isVeg: true,
    },
    {
      name: "Butter Chicken",
      price: 349,
      mrp: 399,
      desc: "Tandoori chicken cooked in rich tomato-butter gravy.",
      img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
      isVeg: false,
    },
    {
      name: "Garlic Naan",
      price: 79,
      mrp: 99,
      desc: "Soft flatbread topped with garlic and coriander.",
      img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800",
      isVeg: true,
    },
    {
      name: "Dal Makhani",
      price: 219,
      mrp: 249,
      desc: "Slow-cooked black lentils with cream and butter.",
      img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800",
      isVeg: true,
    },
  ],
};

const generateMenuForRestaurant = (restaurant) => {
  let items = [];
  const cuisines = (restaurant.cuisines || []).map((c) => c.toLowerCase());

  // Match cuisines and pull items from the pool
  if (cuisines.some((c) => c.includes("biryani")))
    items.push(...menuPool["Biryani"]);
  if (cuisines.some((c) => c.includes("pizza") || c.includes("italian")))
    items.push(...menuPool["Pizza"]);
  if (cuisines.some((c) => c.includes("burger") || c.includes("american")))
    items.push(...menuPool["Burger"]);
  if (
    cuisines.some(
      (c) =>
        c.includes("south indian") ||
        c.includes("dosa") ||
        c.includes("breakfast"),
    )
  )
    items.push(...menuPool["South Indian"]);
  if (cuisines.some((c) => c.includes("chinese") || c.includes("asian")))
    items.push(...menuPool["Chinese"]);
  if (
    cuisines.some(
      (c) =>
        c.includes("dessert") ||
        c.includes("ice cream") ||
        c.includes("bakery"),
    )
  )
    items.push(...menuPool["Desserts"]);
  if (
    cuisines.some(
      (c) =>
        c.includes("north indian") ||
        c.includes("mughlai") ||
        c.includes("punjabi"),
    )
  )
    items.push(...menuPool["North Indian"]);

  // If no match found, default to a basic menu
  if (items.length === 0) {
    items.push(...menuPool["North Indian"]);
  }

  // Shuffle and pick up to 8 items to avoid enormous menus
  items = items.sort(() => 0.5 - Math.random()).slice(0, 8);

  // Format them for the database
  return items.map((item, index) => ({
    restaurant: restaurant._id,
    name: item.name,
    description: item.desc,
    image: item.img,
    price: item.price,
    mrp: item.mrp,
    category: item.isVeg ? "Vegetarian" : "Non-Vegetarian",
    isVeg: item.isVeg,
    isAvailable: true,
    isRecommended: index === 0, // Make the first item a bestseller
    order: index,
  }));
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const restaurants = await Restaurant.find({});
    console.log(`Found ${restaurants.length} restaurants.`);

    let totalInserted = 0;

    for (const restaurant of restaurants) {
      // Clear existing menus for this restaurant to prevent duplicates
      await MenuItem.deleteMany({ restaurant: restaurant._id });

      const newMenu = generateMenuForRestaurant(restaurant);
      await MenuItem.insertMany(newMenu);

      totalInserted += newMenu.length;
    }

    console.log(
      `🚀 Successfully inserted ${totalInserted} menu items across all restaurants!`,
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding menus:", error);
    process.exit(1);
  }
};

seed();
