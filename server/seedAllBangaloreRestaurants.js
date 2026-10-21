import "dotenv/config";
import mongoose from "mongoose";
import Restaurant from "./src/models/Restaurant.js";

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
    img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
  },
  {
    name: "Dosa Camp",
    cuisines: ["South Indian", "Dosa"],
    img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
  },
  {
    name: "Udupi Palace",
    cuisines: ["South Indian", "Vegetarian"],
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
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

  // Biryani & Mughlai
  {
    name: "Paradise Biryani",
    cuisines: ["Biryani", "Hyderabadi", "Mughlai"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Bawarchi Biryani",
    cuisines: ["Biryani", "Mughlai"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Meghana Foods",
    cuisines: ["Biryani", "Andhra", "North Indian"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Hyderabad House",
    cuisines: ["Biryani", "Mughlai"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Manis Dum Biryani",
    cuisines: ["Biryani", "Mughlai"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Pista House",
    cuisines: ["Biryani", "Bakery"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Shah Ghouse Cafe",
    cuisines: ["Biryani", "Middle Eastern"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
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
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
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
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
  },
  {
    name: "Matteo Coffea",
    cuisines: ["Cafe", "Italian", "Bakery"],
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  },
  {
    name: "Dyu Art Cafe",
    cuisines: ["Cafe", "Continental", "Desserts"],
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
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
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Barbeque Nation",
    cuisines: ["North Indian", "Barbecue", "Buffet"],
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
  },
  {
    name: "Absolute Barbecues (AB's)",
    cuisines: ["Barbecue", "North Indian", "Buffet"],
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
  },
  {
    name: "Pind Balluchi",
    cuisines: ["North Indian", "Punjabi"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Kake Di Hatti",
    cuisines: ["North Indian", "Punjabi"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Tandoori Nights",
    cuisines: ["North Indian", "Kebabs"],
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800",
  },

  // Steak, Grill & Fine Dining
  {
    name: "The Only Place",
    cuisines: ["Steak", "Continental", "Italian"],
    img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800",
  },
  {
    name: "Miller's 46",
    cuisines: ["Continental", "Steak", "Pub"],
    img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800",
  },
  {
    name: "Spice Terrace",
    cuisines: ["North Indian", "Fine Dining"],
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  },
  {
    name: "Karavalli",
    cuisines: ["Coastal", "South Indian", "Fine Dining"],
    img: "https://images.unsplash.com/photo-1626500155537-8c7a0c0e1f4b?w=800",
  },
  {
    name: "Grill House",
    cuisines: ["Barbecue", "Grill", "North Indian"],
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
  },

  // Fast Food & Street Style
  {
    name: "Burger King",
    cuisines: ["Burgers", "American", "Fast Food"],
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  },
  {
    name: "McDonald's",
    cuisines: ["Burgers", "Fast Food"],
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
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
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
  },
  {
    name: "Al-Bek",
    cuisines: ["Shawarma", "Mughlai", "Biryani"],
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
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

  // Asian & Pan-Asian
  {
    name: "Wok & Roll",
    cuisines: ["Chinese", "Asian", "Thai"],
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
  },
  {
    name: "Mainland China",
    cuisines: ["Chinese", "Asian", "Fine Dining"],
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
  },
  {
    name: "Chinita Real Mexican Food",
    cuisines: ["Mexican", "Fast Food"],
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
  },
  {
    name: "Bamey's Restaurant",
    cuisines: ["Asian", "Chinese", "Tibetan"],
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
  },
  {
    name: "Sichuan House",
    cuisines: ["Chinese", "Asian", "Sichuan"],
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
  },

  // Desserts & Bakeries
  {
    name: "Corner House Ice Creams",
    cuisines: ["Desserts", "Ice Cream"],
    img: "https://images.unsplash.com/photo-1563805042-7684c8e9e9cb?w=800",
  },
  {
    name: "Glen's Bakehouse",
    cuisines: ["Bakery", "Desserts", "Cafe"],
    img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
  },
  {
    name: "Sweet Tooth",
    cuisines: ["Desserts", "Ice Cream", "Cakes", "Bakery"],
    img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
  },
  {
    name: "Natural Ice Cream",
    cuisines: ["Desserts", "Ice Cream"],
    img: "https://images.unsplash.com/photo-1563805042-7684c8e9e9cb?w=800",
  },
  {
    name: "Baskin Robbins",
    cuisines: ["Desserts", "Ice Cream"],
    img: "https://images.unsplash.com/photo-1563805042-7684c8e9e9cb?w=800",
  },
  {
    name: "Theobroma",
    cuisines: ["Bakery", "Desserts", "Cakes"],
    img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
  },
  {
    name: "Cake Walk",
    cuisines: ["Bakery", "Desserts", "Cakes"],
    img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    await Restaurant.deleteMany({});
    console.log("🧹 Cleared existing restaurants");

    const restaurantData = restaurants.map((r, index) => {
      const rating = (3.8 + Math.random() * 1.1).toFixed(1);
      const reviewCount = Math.floor(500 + Math.random() * 5000);
      const deliveryTime = Math.floor(20 + Math.random() * 25);
      const priceForTwo = Math.floor(300 + Math.random() * 600);
      const isFeatured = index < 8;

      return {
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
        offer: index % 3 === 0 ? "50% OFF up to ₹100" : "",
        isVeg: false,
        isActive: true,
        isFeatured: isFeatured,
      };
    });

    await Restaurant.insertMany(restaurantData);
    console.log(
      `🚀 Successfully inserted ${restaurantData.length} restaurants with fixed images!`,
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seed();
