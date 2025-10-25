// scripts/list-users.js
// Script to list all users in the database

const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const listUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    // Get all users
    const users = await User.find().select("-password");

    console.log(`📊 Total Users: ${users.length}\n`);

    if (users.length === 0) {
      console.log("No users found in the database.");
      return;
    }

    // Group users by role
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {});

    // Display users by role
    Object.keys(usersByRole).forEach((role) => {
      console.log(
        `🔐 ${role.toUpperCase()} USERS (${usersByRole[role].length}):`
      );
      usersByRole[role].forEach((user) => {
        console.log(`  📧 ${user.email}`);
        console.log(`  👤 ${user.firstName} ${user.lastName}`);
        console.log(`  ✅ Approved: ${user.isApproved}`);
        console.log(`  📱 Mobile: ${user.mobileNumber}`);
        console.log("");
      });
    });
  } catch (error) {
    console.error("❌ Error listing users:", error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the script
listUsers();
