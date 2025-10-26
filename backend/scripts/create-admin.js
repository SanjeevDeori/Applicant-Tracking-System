// scripts/create-admin.js
// Script to create an admin user directly in the database

const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Approved: ${existingAdmin.isApproved}`);
      return;
    }

    // Create admin user
    const adminData = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@ats.com",
      password: "admin123", // This will be hashed automatically
      mobileNumber: "9999999999", // Unique mobile number
      role: "admin",
      isApproved: true, // Admin is approved by default
      academicHistory: {
        grade10: 85,
        grade12: 85,
        courseName: "Bachelor of Technology",
        courseStartDate: new Date("2020-01-01"),
        isCurrentlyEnrolled: false,
      },
    };

    const admin = await User.create(adminData);

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@ats.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Name: Admin User");
    console.log("🔐 Role: admin");
    console.log("✅ Approved: true");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the script
createAdmin();
