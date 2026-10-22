/**
 * ============================================================
 * SEED USERS (Admin, Customers)
 * ============================================================
 * Run: node seedUsers.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";

const USERS = [
  {
    name: "Admin User",
    email: "admin@foodie.com",
    password: "password123",
    phone: "9876543210",
    role: "admin",
  },
  {
    name: "Test Customer",
    email: "testcustomer@example.com",
    password: "password123",
    phone: "9123456780",
    role: "customer",
  },
  {
    name: "Prasad Nekkalapudi",
    email: "nnvdprasad@gmail.com",
    password: "password123",
    phone: "9986053518",
    role: "customer",
  },
  {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
    phone: "9000000001",
    role: "customer",
  },
  {
    name: "John Smith",
    email: "john@example.com",
    password: "password123",
    phone: "9000000002",
    role: "customer",
  },
];

const seedUsers = async () => {
  try {
    console.log("✅ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("🧹 Clearing existing users...");
    await User.deleteMany({});

    console.log("👥 Creating users...\n");

    for (const userData of USERS) {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });

      console.log(
        `✅ Created ${user.role.padEnd(8)}: ${user.name} (${user.email})`,
      );
    }

    console.log("\n🎉 USER SEED COMPLETE!");
    console.log("-----------------------------------------");
    console.log("Admin Login: admin@foodie.com / password123");
    console.log("Customer Login: testcustomer@example.com / password123");
    console.log("-----------------------------------------");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seed error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedUsers();
