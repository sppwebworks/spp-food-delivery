import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";
import DeliveryPartner from "./src/models/DeliveryPartner.js";

const RIDERS = [
  {
    name: "Rahul Sharma",
    phone: "9876543210",
    vehicle: "bike",
    plate: "KA01AB1234",
  },
  {
    name: "Amit Patel",
    phone: "9876543211",
    vehicle: "scooter",
    plate: "KA02CD5678",
  },
  {
    name: "Suresh Kumar",
    phone: "9876543212",
    vehicle: "bike",
    plate: "KA03EF9012",
  },
  {
    name: "Vikram Singh",
    phone: "9876543213",
    vehicle: "bike",
    plate: "KA04GH3456",
  },
  {
    name: "Ravi Verma",
    phone: "9876543214",
    vehicle: "car",
    plate: "KA05IJ7890",
  },
  {
    name: "Priya Sharma",
    phone: "9876543215",
    vehicle: "scooter",
    plate: "KA06KL2345",
  },
  {
    name: "Neha Gupta",
    phone: "9876543216",
    vehicle: "scooter",
    plate: "KA07MN6789",
  },
  {
    name: "Anjali Desai",
    phone: "9876543217",
    vehicle: "bike",
    plate: "KA08OP1234",
  },
  {
    name: "Kiran Rao",
    phone: "9876543218",
    vehicle: "bike",
    plate: "KA09QR5678",
  },
  {
    name: "Deepak Nair",
    phone: "9876543219",
    vehicle: "car",
    plate: "KA10ST9012",
  },
];

const seedRiders = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const hashedPassword = await bcrypt.hash("password123", 12);

    for (let i = 0; i < RIDERS.length; i++) {
      const r = RIDERS[i];
      const email = `rider${i + 1}@test.com`;

      // Check if user already exists to prevent duplicates
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name: r.name,
          email: email,
          phone: r.phone,
          password: hashedPassword,
          role: "rider",
        });
        console.log(`👤 Created User: ${r.name} (${email})`);
      } else {
        console.log(`👤 User already exists: ${email}`);
        user.role = "rider";
        await user.save();
      }

      // Check if DeliveryPartner profile exists
      let partner = await DeliveryPartner.findOne({ user: user._id });

      if (!partner) {
        // Make 5 riders online, 5 offline
        const isOnline = i < 5;

        await DeliveryPartner.create({
          user: user._id,
          phone: r.phone,
          vehicleType: r.vehicle,
          vehicleNumber: r.plate,
          isApproved: true,
          isOnline: isOnline,
          status: isOnline ? "available" : "offline",
          rating: (4.0 + Math.random()).toFixed(1), // Random rating 4.0 - 5.0
          totalDeliveries: Math.floor(Math.random() * 100),
          totalEarnings: Math.floor(Math.random() * 5000),
          currentLocation: {
            type: "Point",
            coordinates: [77.5946, 12.9716], // Bangalore coordinates
          },
        });
        console.log(
          `🛵 Created Rider Profile: ${r.name} | Status: ${isOnline ? "ONLINE" : "OFFLINE"}`,
        );
      } else {
        console.log(`🛵 Rider Profile already exists for: ${r.name}`);
      }
    }

    console.log("\n🚀 Successfully seeded 10 riders!");
    console.log("📧 Emails: rider1@test.com ... rider10@test.com");
    console.log("🔑 Password: password123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding riders:", error);
    process.exit(1);
  }
};

seedRiders();
