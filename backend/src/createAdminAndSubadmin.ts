import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import AuthUser from "./models/AuthUser"; // Update path as needed
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function createUsers() {
  try {
    await mongoose.connect(MONGO_URI!);

    const users = [
      { email: "singh.thakur2226@gmail.com", name: "Admin User", role: "admin" },
      {
        email: "subadmin@hoteldixit.com",
        name: "Sub Admin User",
        role: "subadmin",
      },
    ];

    const password = "dixit@123";

    for (let userData of users) {
      const existingUser = await AuthUser.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User with email ${userData.email} already exists.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new AuthUser({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      });
      await user.save();
      console.log(`Created user: ${userData.email} with role ${userData.role}`);
    }

    mongoose.disconnect();
  } catch (error) {
    console.error("Error creating users:", error);
    mongoose.disconnect();
    process.exit(1);
  }
}

createUsers();
