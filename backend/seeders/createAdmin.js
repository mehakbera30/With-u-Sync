const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set in .env");
         await mongoose.connect(process.env.MONGO_URI);
         console.log(`Connected to database: ${mongoose.connection.name}`);

    const email = (process.env.ADMIN_EMAIL || "admin@withusync.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error("ADMIN_PASSWORD must be set in .env");
    }

    // Keep exactly one authorized administrator account.
    await User.updateMany(
      { role: "admin", email: { $ne: email } },
      { $set: { role: "patient" } }
    );

    let admin = await User.findOne({ email });

    if (admin) {
      admin.role = "admin";
      admin.name = "WithUSync Admin";
      admin.notificationsEnabled = true;
      admin.password = adminPassword;
      await admin.save();

      console.log("Existing user converted to admin.");
    } else {
      admin = await User.create({
        name: "WithUSync Admin",
        email,
        password: adminPassword,
        role: "admin",
        notificationsEnabled: true,
      });

      console.log("Admin account created.");
    }

    console.log(`Admin Email: ${email}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Create admin error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();
