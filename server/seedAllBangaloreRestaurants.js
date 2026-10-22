import "dotenv/config";
import mongoose from "mongoose";
import Restaurant from "./src/models/Restaurant.js";
import MenuItem from "./src/models/MenuItem.js";

// ---------------------------------------------------------
// 1. IMAGE DICTIONARY (Exact images for specific dishes)
// ---------------------------------------------------------
const FOOD_IMAGES = {
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  chicken65:
    "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800",
  kebab: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800",
  paneer: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
  dosa: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
  idli: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800",
  pasta: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
  noodles: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
  momos: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800",
  shawarma:
    "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
  roll: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  curry: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  naan: "https://images.unsplash.com/photo-1605333396880-4749f467f140?w=800",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
  icecream: "https://images.unsplash.com/photo-1563805042-7684c8e9e9cb?w=800",
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
  sandwich:
    "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
  soup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
  seafood: "https://images.unsplash.com/photo-1559742811-822873691df8?w=800",
  taco: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
};

// ---------------------------------------------------------
// 2. MENU GENERATOR (Creates a full menu based on cuisine)
// ---------------------------------------------------------
const getMenuForCuisine = (primaryCuisine) => {
  const menus = {
    "South Indian": [
      {
        name: "Masala Dosa",
        price: 120,
        isVeg: true,
        cat: "Dosas",
        img: FOOD_IMAGES.dosa,
      },
      {
        name: "Ghee Podi Dosa",
        price: 150,
        isVeg: true,
        cat: "Dosas",
        img: FOOD_IMAGES.dosa,
      },
      {
        name: "Idli Vada Combo",
        price: 90,
        isVeg: true,
        cat: "Tiffins",
        img: FOOD_IMAGES.idli,
      },
      {
        name: "Rava Kesari",
        price: 80,
        isVeg: true,
        cat: "Desserts",
        img: FOOD_IMAGES.cake,
      },
      {
        name: "Filter Coffee",
        price: 40,
        isVeg: true,
        cat: "Beverages",
        img: FOOD_IMAGES.coffee,
      },
    ],
    Biryani: [
      {
        name: "Chicken Dum Biryani",
        price: 349,
        isVeg: false,
        cat: "Biryani",
        img: FOOD_IMAGES.biryani,
      },
      {
        name: "Mutton Dum Biryani",
        price: 449,
        isVeg: false,
        cat: "Biryani",
        img: FOOD_IMAGES.biryani,
      },
      {
        name: "Veg Dum Biryani",
        price: 299,
        isVeg: true,
        cat: "Biryani",
        img: FOOD_IMAGES.biryani,
      },
      {
        name: "Chicken 65",
        price: 249,
        isVeg: false,
        cat: "Starters",
        img: FOOD_IMAGES.chicken65,
      },
      {
        name: "Double Ka Meetha",
        price: 149,
        isVeg: true,
        cat: "Desserts",
        img: FOOD_IMAGES.cake,
      },
    ],
    Pizza: [
      {
        name: "Margherita Pizza",
        price: 249,
        isVeg: true,
        cat: "Pizzas",
        img: FOOD_IMAGES.pizza,
      },
      {
        name: "Pepperoni Pizza",
        price: 399,
        isVeg: false,
        cat: "Pizzas",
        img: FOOD_IMAGES.pizza,
      },
      {
        name: "Garlic Breadsticks",
        price: 149,
        isVeg: true,
        cat: "Sides",
        img: FOOD_IMAGES.naan,
      },
      {
        name: "Alfredo Pasta",
        price: 299,
        isVeg: true,
        cat: "Pastas",
        img: FOOD_IMAGES.pasta,
      },
      {
        name: "Choco Lava Cake",
        price: 99,
        isVeg: true,
        cat: "Desserts",
        img: FOOD_IMAGES.cake,
      },
    ],
    Burgers: [
      {
        name: "Classic Veg Burger",
        price: 149,
        isVeg: true,
        cat: "Burgers",
        img: FOOD_IMAGES.burger,
      },
      {
        name: "Crispy Chicken Burger",
        price: 199,
        isVeg: false,
        cat: "Burgers",
        img: FOOD_IMAGES.burger,
      },
      {
        name: "Peri Peri Fries",
        price: 129,
        isVeg: true,
        cat: "Sides",
        img: FOOD_IMAGES.fries,
      },
      {
        name: "Chocolate Milkshake",
        price: 149,
        isVeg: true,
        cat: "Beverages",
        img: FOOD_IMAGES.icecream,
      },
    ],
    Chinese: [
      {
        name: "Veg Hakka Noodles",
        price: 199,
        isVeg: true,
        cat: "Noodles",
        img: FOOD_IMAGES.noodles,
      },
      {
        name: "Chicken Fried Rice",
        price: 249,
        isVeg: false,
        cat: "Rice",
        img: FOOD_IMAGES.noodles,
      },
      {
        name: "Veg Manchurian Dry",
        price: 199,
        isVeg: true,
        cat: "Starters",
        img: FOOD_IMAGES.chicken65,
      },
      {
        name: "Spring Rolls",
        price: 149,
        isVeg: true,
        cat: "Starters",
        img: FOOD_IMAGES.roll,
      },
      {
        name: "Hot & Sour Soup",
        price: 129,
        isVeg: true,
        cat: "Soups",
        img: FOOD_IMAGES.soup,
      },
    ],
    "North Indian": [
      {
        name: "Paneer Butter Masala",
        price: 280,
        isVeg: true,
        cat: "Curries",
        img: FOOD_IMAGES.paneer,
      },
      {
        name: "Butter Chicken",
        price: 350,
        isVeg: false,
        cat: "Curries",
        img: FOOD_IMAGES.curry,
      },
      {
        name: "Dal Makhani",
        price: 250,
        isVeg: true,
        cat: "Curries",
        img: FOOD_IMAGES.curry,
      },
      {
        name: "Butter Naan",
        price: 60,
        isVeg: true,
        cat: "Breads",
        img: FOOD_IMAGES.naan,
      },
      {
        name: "Chicken Tikka",
        price: 290,
        isVeg: false,
        cat: "Starters",
        img: FOOD_IMAGES.kebab,
      },
    ],
    Cafe: [
      {
        name: "Cappuccino",
        price: 180,
        isVeg: true,
        cat: "Coffee",
        img: FOOD_IMAGES.coffee,
      },
      {
        name: "Club Sandwich",
        price: 220,
        isVeg: false,
        cat: "Sandwiches",
        img: FOOD_IMAGES.sandwich,
      },
      {
        name: "Blueberry Cheesecake",
        price: 250,
        isVeg: true,
        cat: "Desserts",
        img: FOOD_IMAGES.cake,
      },
      {
        name: "Caesar Salad",
        price: 210,
        isVeg: true,
        cat: "Salads",
        img: FOOD_IMAGES.salad,
      },
    ],
    Desserts: [
      {
        name: "Belgian Chocolate Cake",
        price: 299,
        isVeg: true,
        cat: "Cakes",
        img: FOOD_IMAGES.cake,
      },
      {
        name: "Red Velvet Pastry",
        price: 149,
        isVeg: true,
        cat: "Pastries",
        img: FOOD_IMAGES.cake,
      },
      {
        name: "Vanilla Ice Cream",
        price: 99,
        isVeg: true,
        cat: "Ice Creams",
        img: FOOD_IMAGES.icecream,
      },
      {
        name: "Chocolate Shake",
        price: 179,
        isVeg: true,
        cat: "Beverages",
        img: FOOD_IMAGES.icecream,
      },
    ],
    "Fast Food": [
      {
        name: "Shawarma Roll",
        price: 180,
        isVeg: false,
        cat: "Shawarma",
        img: FOOD_IMAGES.shawarma,
      },
      {
        name: "Paneer Roll",
        price: 160,
        isVeg: true,
        cat: "Rolls",
        img: FOOD_IMAGES.roll,
      },
      {
        name: "Steamed Momos",
        price: 120,
        isVeg: true,
        cat: "Momos",
        img: FOOD_IMAGES.momos,
      },
      {
        name: "French Fries",
        price: 99,
        isVeg: true,
        cat: "Sides",
        img: FOOD_IMAGES.fries,
      },
    ],
    Asian: [
      {
        name: "Sushi Platter",
        price: 499,
        isVeg: false,
        cat: "Sushi",
        img: FOOD_IMAGES.seafood,
      },
      {
        name: "Chicken Dim Sum",
        price: 299,
        isVeg: false,
        cat: "Dim Sum",
        img: FOOD_IMAGES.momos,
      },
      {
        name: "Thai Green Curry",
        price: 349,
        isVeg: false,
        cat: "Curries",
        img: FOOD_IMAGES.curry,
      },
    ],
    Mexican: [
      {
        name: "Chicken Taco",
        price: 199,
        isVeg: false,
        cat: "Tacos",
        img: FOOD_IMAGES.taco,
      },
      {
        name: "Veg Burrito",
        price: 249,
        isVeg: true,
        cat: "Burritos",
        img: FOOD_IMAGES.roll,
      },
    ],
    Seafood: [
      {
        name: "Grilled Fish",
        price: 450,
        isVeg: false,
        cat: "Seafood",
        img: FOOD_IMAGES.seafood,
      },
      {
        name: "Prawn Curry",
        price: 399,
        isVeg: false,
        cat: "Curries",
        img: FOOD_IMAGES.curry,
      },
    ],
  };

  // Fallback to Fast Food if cuisine isn't explicitly mapped
  return menus[primaryCuisine] || menus["Fast Food"];
};

// ---------------------------------------------------------
// 3. RESTAURANT DATA (150 Restaurants)
// ---------------------------------------------------------
const restaurants = [
  // Legendary & Traditional South Indian
  {
    name: "MTR (Mavalli Tiffin Rooms)",
    cuisines: ["South Indian", "Breakfast"],
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
  },
  {
    name: "Vidyarthi Bhavan",
    cuisines: ["South Indian", "Dosa"],
    img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
  },
  {
    name: "CTR (Shri Sagar)",
    cuisines: ["South Indian", "Breakfast"],
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
  },
  {
    name: "Brahmin's Coffee Bar",
    cuisines: ["South Indian", "Beverages"],
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
  },
  {
    name: "Veena Stores",
    cuisines: ["South Indian", "Snacks"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Rameshwaram Cafe",
    cuisines: ["South Indian", "Fast Food"],
    img: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800",
  },
  {
    name: "Dosa Camp",
    cuisines: ["South Indian", "Dosa"],
    img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
  },
  {
    name: "Udupi Palace",
    cuisines: ["South Indian", "Vegetarian"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Sagar Ratna",
    cuisines: ["South Indian", "North Indian"],
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
  },
  {
    name: "New Krishna Bhavan",
    cuisines: ["South Indian", "Thali"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Janatha Hotel",
    cuisines: ["South Indian", "Breakfast"],
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
  },
  {
    name: "Maiyas",
    cuisines: ["South Indian", "Thali"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Hotel Dwaraka",
    cuisines: ["South Indian", "North Indian"],
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
  },
  {
    name: "Shanti Sagar",
    cuisines: ["South Indian", "Fast Food"],
    img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
  },
  {
    name: "Polar Bear",
    cuisines: ["Desserts", "Ice Cream"],
    img: "https://images.unsplash.com/photo-1563805042-7684c8e9e9cb?w=800",
  },

  // Biryani & Mughlai
  {
    name: "Paradise Biryani",
    cuisines: ["Biryani", "Hyderabadi", "Mughlai"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Bawarchi Biryani",
    cuisines: ["Biryani", "Mughlai"],
    img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
  },
  {
    name: "Meghana Foods",
    cuisines: ["Biryani", "Andhra", "North Indian"],
    img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800",
  },
  {
    name: "Hyderabad House",
    cuisines: ["Biryani", "Mughlai"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Manis Dum Biryani",
    cuisines: ["Biryani", "Mughlai"],
    img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
  },
  {
    name: "Pista House",
    cuisines: ["Biryani", "Bakery"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Shah Ghouse Cafe",
    cuisines: ["Biryani", "Middle Eastern"],
    img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800",
  },
  {
    name: "Nagarjuna",
    cuisines: ["Andhra", "Biryani"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Kritunga",
    cuisines: ["Andhra", "Biryani"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Tandoori Taal",
    cuisines: ["North Indian", "Mughlai"],
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800",
  },
  {
    name: "Donne Biryani",
    cuisines: ["Biryani", "South Indian"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Anand Dum Biryani",
    cuisines: ["Biryani", "North Indian"],
    img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
  },
  {
    name: "SGS Gundappa Donne Biryani",
    cuisines: ["Biryani", "South Indian"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Al Kareem",
    cuisines: ["Mughlai", "Kebabs"],
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800",
  },
  {
    name: "Kabab Magic",
    cuisines: ["Kebabs", "Mughlai"],
    img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800",
  },

  // Italian, Continental & Cafes
  {
    name: "Truffles",
    cuisines: ["Burgers", "American", "Fast Food"],
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  },
  {
    name: "Toit",
    cuisines: ["Pizza", "Continental", "Italian"],
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
  },
  {
    name: "Little Italy",
    cuisines: ["Italian", "Pizza", "Pasta"],
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  },
  {
    name: "Onesta",
    cuisines: ["Pizza", "Italian", "Desserts"],
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
  },
  {
    name: "Fatty Bao",
    cuisines: ["Asian", "Chinese", "Pan-Asian"],
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
  },
  {
    name: "The Humming Tree",
    cuisines: ["Continental", "Cafe"],
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  },
  {
    name: "Third Wave Coffee",
    cuisines: ["Cafe", "Beverages", "Desserts"],
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
  },
  {
    name: "Blue Tokai Coffee",
    cuisines: ["Cafe", "Beverages"],
    img: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800",
  },
  {
    name: "Matteo Coffea",
    cuisines: ["Cafe", "Italian", "Bakery"],
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  },
  {
    name: "Dyu Art Cafe",
    cuisines: ["Cafe", "Continental", "Desserts"],
    img: "https://images.unsplash.com/photo-1495474472201-3509f8f6094c?w=800",
  },
  {
    name: "Glen's Bakehouse",
    cuisines: ["Bakery", "Desserts", "Cafe"],
    img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
  },
  {
    name: "The Black Pearl",
    cuisines: ["Continental", "Italian", "Pub"],
    img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
  {
    name: "Big Brewsky",
    cuisines: ["Continental", "Pub", "Finger Food"],
    img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
  {
    name: "Windmills Craftworks",
    cuisines: ["Continental", "American", "Fine Dining"],
    img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
  {
    name: "Arbor Brewing Company",
    cuisines: ["Continental", "Pizza", "Pub"],
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  },

  // North Indian & Punjabi
  {
    name: "Punjabi Rasoi",
    cuisines: ["North Indian", "Punjabi"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Copper Chimney",
    cuisines: ["North Indian", "Mughlai"],
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800",
  },
  {
    name: "Barbeque Nation",
    cuisines: ["North Indian", "Barbecue", "Buffet"],
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
  },
  {
    name: "Absolute Barbecues (AB's)",
    cuisines: ["Barbecue", "North Indian", "Buffet"],
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
  },
  {
    name: "Pind Balluchi",
    cuisines: ["North Indian", "Punjabi"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Kake Di Hatti",
    cuisines: ["North Indian", "Punjabi"],
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800",
  },
  {
    name: "Tandoori Nights",
    cuisines: ["North Indian", "Kebabs"],
    img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800",
  },
  {
    name: "Mainland China",
    cuisines: ["Chinese", "Asian", "Fine Dining"],
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
  },
  {
    name: "Wok & Roll",
    cuisines: ["Chinese", "Asian", "Thai"],
    img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
  },
  {
    name: "Bamey's Restaurant",
    cuisines: ["Asian", "Chinese", "Tibetan"],
    img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800",
  },
  {
    name: "Sichuan House",
    cuisines: ["Chinese", "Asian", "Sichuan"],
    img: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800",
  },
  {
    name: "Spice Terrace",
    cuisines: ["North Indian", "Fine Dining"],
    img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
  {
    name: "Karavalli",
    cuisines: ["Coastal", "South Indian", "Fine Dining"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "The Only Place",
    cuisines: ["Steak", "Continental", "Italian"],
    img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800",
  },
  {
    name: "Miller's 46",
    cuisines: ["Continental", "Steak", "Pub"],
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
  },

  // Fast Food, Street Style & Global Chains
  {
    name: "Burger King",
    cuisines: ["Burgers", "American", "Fast Food"],
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  },
  {
    name: "McDonald's",
    cuisines: ["Burgers", "Fast Food"],
    img: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=800",
  },
  {
    name: "KFC",
    cuisines: ["Fried Chicken", "Fast Food", "American"],
    img: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=800",
  },
  {
    name: "Domino's Pizza",
    cuisines: ["Pizza", "Fast Food", "Italian"],
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
  },
  {
    name: "Empire Restaurant",
    cuisines: ["Biryani", "Shawarma", "North Indian"],
    img: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800",
  },
  {
    name: "Al-Bek",
    cuisines: ["Shawarma", "Mughlai", "Biryani"],
    img: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
  },
  {
    name: "Rolls On Wheels",
    cuisines: ["Rolls", "Street Food", "Fast Food"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Wow! Momo",
    cuisines: ["Momos", "Chinese", "Tibetan"],
    img: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800",
  },
  {
    name: "Goli Vada Pav",
    cuisines: ["Street Food", "Snacks", "Fast Food"],
    img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800",
  },
  {
    name: "Chinita Real Mexican Food",
    cuisines: ["Mexican", "Fast Food"],
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
  },
  {
    name: "Leon Grill",
    cuisines: ["Burgers", "Fast Food", "Continental"],
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  },
  {
    name: "Pizza Hut",
    cuisines: ["Pizza", "Fast Food", "Italian"],
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
  },
  {
    name: "Subway",
    cuisines: ["Sandwiches", "Healthy Food", "Fast Food"],
    img: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800",
  },
  {
    name: "Taco Bell",
    cuisines: ["Mexican", "Fast Food"],
    img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
  },
  {
    name: "Faasos",
    cuisines: ["Wraps", "Rolls", "Fast Food"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },

  // Desserts & Bakeries
  {
    name: "Corner House Ice Creams",
    cuisines: ["Desserts", "Ice Cream"],
    img: "https://images.unsplash.com/photo-1563805042-7684c8e9e9cb?w=800",
  },
  {
    name: "Sweet Tooth",
    cuisines: ["Desserts", "Ice Cream", "Cakes", "Bakery"],
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
  },
  {
    name: "Natural Ice Cream",
    cuisines: ["Desserts", "Ice Cream"],
    img: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800",
  },
  {
    name: "Baskin Robbins",
    cuisines: ["Desserts", "Ice Cream"],
    img: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800",
  },
  {
    name: "Theobroma",
    cuisines: ["Bakery", "Desserts", "Cakes"],
    img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
  },
  {
    name: "Cake Walk",
    cuisines: ["Bakery", "Desserts", "Cakes"],
    img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
  },
  {
    name: "Anand Sweets",
    cuisines: ["Sweets", "Desserts"],
    img: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=800",
  },
  {
    name: "Kanti Sweets",
    cuisines: ["Sweets", "Desserts"],
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
  },
  {
    name: "Albert Bakery",
    cuisines: ["Bakery", "Snacks"],
    img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
  },
  {
    name: "Lavonne",
    cuisines: ["Bakery", "Cafe", "Desserts"],
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  },
  {
    name: "Smoor",
    cuisines: ["Chocolates", "Desserts", "Cakes"],
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
  },
  {
    name: "Macaron Boutique",
    cuisines: ["Desserts", "Bakery"],
    img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
  },
  {
    name: "Amma's Pastries",
    cuisines: ["Bakery", "Cakes"],
    img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
  },
  {
    name: "Ice Cream Works",
    cuisines: ["Ice Cream", "Desserts"],
    img: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800",
  },
  {
    name: "Frozen Bottle",
    cuisines: ["Beverages", "Desserts", "Milkshakes"],
    img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800",
  },

  // More Diverse & Local Favorites
  {
    name: "Puliyogare Point",
    cuisines: ["South Indian", "Snacks"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Hallimane",
    cuisines: ["North Karnataka", "Thali"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Oota",
    cuisines: ["Karnataka", "Fine Dining"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Coastal Curry",
    cuisines: ["Coastal", "Seafood"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Savoury",
    cuisines: ["Biryani", "Mughlai"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Fanoos",
    cuisines: ["Shawarma", "Middle Eastern"],
    img: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
  },
  {
    name: "Sultan's Kitchen",
    cuisines: ["Mughlai", "Biryani"],
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800",
  },
  {
    name: "Hyderabad Biryani House",
    cuisines: ["Biryani", "Hyderabadi"],
    img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
  },
  {
    name: "Biriyani Zone",
    cuisines: ["Biryani", "North Indian"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Tandoor",
    cuisines: ["North Indian", "Mughlai"],
    img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800",
  },

  // New Additions (50 More)
  {
    name: "The Rameshwaram Cafe (Indiranagar)",
    cuisines: ["South Indian", "Fast Food"],
    img: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800",
  },
  {
    name: "Taaza Thindi",
    cuisines: ["South Indian", "Breakfast"],
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
  },
  {
    name: "Davanagere Benne Dosa",
    cuisines: ["South Indian", "Dosa"],
    img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
  },
  {
    name: "Arogya Ahaara",
    cuisines: ["Healthy Food", "Salads"],
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
  },
  {
    name: "Green Theory",
    cuisines: ["Continental", "Vegetarian", "Cafe"],
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  },
  {
    name: "Pasta Street",
    cuisines: ["Italian", "Pasta"],
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  },
  {
    name: "Chianti",
    cuisines: ["Italian", "Fine Dining"],
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  },
  {
    name: "SodaBottleOpenerWala",
    cuisines: ["Parsi", "North Indian"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "The Permit Room",
    cuisines: ["South Indian", "Pub"],
    img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
  {
    name: "Koshy's",
    cuisines: ["Continental", "Cafe"],
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  },
  {
    name: "Ebony",
    cuisines: ["Continental", "Fine Dining"],
    img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
  {
    name: "Sunny's",
    cuisines: ["Italian", "Continental"],
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  },
  {
    name: "Chutney Chang",
    cuisines: ["Buffet", "North Indian", "Chinese"],
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
  },
  {
    name: "The Fisherman's Wharf",
    cuisines: ["Seafood", "Goan", "Fine Dining"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Coastal Express",
    cuisines: ["Coastal", "Seafood"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Nandhana Palace",
    cuisines: ["Andhra", "Biryani"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Ulavacharu",
    cuisines: ["Andhra", "Biryani"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Spicy Venue",
    cuisines: ["Andhra", "Biryani"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Hyderabad Chefs",
    cuisines: ["Biryani", "Mughlai"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Hotel Nandhini",
    cuisines: ["North Indian", "Biryani"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Kamath Hotel",
    cuisines: ["South Indian", "Thali"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Woodlands",
    cuisines: ["South Indian", "Vegetarian"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Dasaprakash",
    cuisines: ["South Indian", "Vegetarian"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "A2B (Adyar Ananda Bhavan)",
    cuisines: ["South Indian", "Sweets"],
    img: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=800",
  },
  {
    name: "Bikanervala",
    cuisines: ["North Indian", "Sweets"],
    img: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=800",
  },
  {
    name: "Haldirams",
    cuisines: ["North Indian", "Sweets"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Chai Point",
    cuisines: ["Beverages", "Snacks"],
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
  },
  {
    name: "Chaayos",
    cuisines: ["Beverages", "Snacks"],
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
  },
  {
    name: "Starbucks",
    cuisines: ["Cafe", "Beverages"],
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
  },
  {
    name: "Coffee Day",
    cuisines: ["Cafe", "Beverages"],
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
  },
  {
    name: "Dunkin' Donuts",
    cuisines: ["Desserts", "Bakery", "Cafe"],
    img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
  },
  {
    name: "Krispy Kreme",
    cuisines: ["Desserts", "Bakery"],
    img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
  },
  {
    name: "Taco Bell",
    cuisines: ["Mexican", "Fast Food"],
    img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
  },
  {
    name: "California Burrito",
    cuisines: ["Mexican", "Fast Food"],
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
  },
  {
    name: "Biryani Blues",
    cuisines: ["Biryani", "Mughlai"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Behrouz Biryani",
    cuisines: ["Biryani", "Mughlai"],
    img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
  },
  {
    name: "Lucknowi Biryani",
    cuisines: ["Biryani", "Awadhi"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Biryani House",
    cuisines: ["Biryani", "North Indian"],
    img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
  },
  {
    name: "Pizza Express",
    cuisines: ["Italian", "Pizza"],
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
  },
  {
    name: "Sbarro",
    cuisines: ["Italian", "Pizza"],
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
  },
  {
    name: "Pasta Bar",
    cuisines: ["Italian", "Pasta"],
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  },
  {
    name: "Spaghetti Kitchen",
    cuisines: ["Italian", "Continental"],
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  },
  {
    name: "The Grill",
    cuisines: ["Steak", "Continental"],
    img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800",
  },
  {
    name: "Steak House",
    cuisines: ["Steak", "Continental"],
    img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800",
  },
  {
    name: "BBQ Nation",
    cuisines: ["Barbecue", "North Indian"],
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
  },
  {
    name: "Grill & Bar",
    cuisines: ["Barbecue", "Pub"],
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
  },
  {
    name: "The Pub",
    cuisines: ["Pub", "Continental"],
    img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
  {
    name: "Pecos",
    cuisines: ["Pub", "American"],
    img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
  {
    name: "Purple Haze",
    cuisines: ["Pub", "Continental"],
    img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
  {
    name: "Gilly's",
    cuisines: ["Pub", "Continental"],
    img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
];

// ---------------------------------------------------------
// 4. SEED FUNCTION
// ---------------------------------------------------------
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log("🧹 Cleared existing restaurants and menus");

    let totalMenusAdded = 0;

    for (let i = 0; i < restaurants.length; i++) {
      const r = restaurants[i];

      const rating = (3.8 + Math.random() * 1.1).toFixed(1);
      const reviewCount = Math.floor(500 + Math.random() * 5000);
      const deliveryTime = Math.floor(20 + Math.random() * 25);
      const priceForTwo = Math.floor(300 + Math.random() * 600);
      const isFeatured = i < 8;

      // 1. Create the Restaurant
      const restaurantDoc = await Restaurant.create({
        name: r.name,
        description: `Experience the best of ${r.cuisines.join(", ")} at ${r.name}.`,
        image: r.img,
        cuisines: r.cuisines,
        address: {
          line1: `12th Main Road, ${Math.floor(1 + Math.random() * 15)}th Cross`,
          line2: "Near Metro Station",
          city: "Bangalore",
          pincode: "560001",
        },
        phone: `080412${Math.floor(10000 + Math.random() * 90000)}`,
        rating: Number(rating),
        reviewCount: reviewCount,
        deliveryTime: deliveryTime,
        priceForTwo: priceForTwo,
        offer: i % 3 === 0 ? "50% OFF up to ₹100" : "",
        isVeg: false,
        isActive: true,
        isFeatured: isFeatured,
      });

      // 2. Get the specific menu for this restaurant's primary cuisine
      // (e.g., if it's a Biryani place, get the Biryani menu)
      const primaryCuisine = r.cuisines[0];
      const menuTemplate = getMenuForCuisine(primaryCuisine);

      // 3. Create the Menu Items linked to this Restaurant
      const menuItems = menuTemplate.map((item, idx) => ({
        restaurant: restaurantDoc._id,
        name: item.name,
        description: `Delicious ${item.name} prepared with authentic spices.`,
        image: item.img, // ✅ Each item has its specific image
        price: item.price,
        mrp: item.price + 50,
        category: item.cat,
        isVeg: item.isVeg,
        isAvailable: true,
        isRecommended: idx === 0,
        order: idx,
      }));

      await MenuItem.insertMany(menuItems);
      totalMenusAdded += menuItems.length;

      console.log(
        `✅ ${restaurantDoc.name} — ${menuItems.length} menu items added.`,
      );
    }

    console.log(
      `\n🚀 Successfully inserted ${restaurants.length} restaurants!`,
    );
    console.log(
      `🍔 Successfully inserted ${totalMenusAdded} unique menu items!`,
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seed();
