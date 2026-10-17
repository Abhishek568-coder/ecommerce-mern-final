// Promote a registered user to admin.
//
//   node makeAdmin.js                 -> list all users and their roles
//   node makeAdmin.js user@email.com  -> make that user an admin

const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const email = process.argv[2];

    // 📋 No email → just list the users so you can pick one
    if (!email) {
      const users = await User.find().select("name email role");

      if (!users.length) {
        console.log(
          "No users found. Register an account in the app first."
        );
      } else {
        console.table(
          users.map((u) => ({
            name: u.name,
            email: u.email,
            role: u.role,
          }))
        );
        console.log("\nPromote someone with: node makeAdmin.js <email>");
      }

      process.exit(0);
    }

    // exact match first (same as login), then case-insensitive fallback
    let user = await User.findOne({ email: email.trim() });

    if (!user) {
      user = await User.findOne({
        email: new RegExp(`^${escapeRegex(email.trim())}$`, "i"),
      });
    }

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(
      `✅ ${user.name} (${user.email}) is now an admin. Log out and back in to see the Admin Dashboard.`
    );

    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

run();
