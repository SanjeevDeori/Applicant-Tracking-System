// server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error"); // The new middleware
const { setupSocketHandlers } = require("./socket/socketHandler");

// Load env variables (MUST be before connectDB)
require("dotenv").config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  },
});

// Setup Socket.io handlers
setupSocketHandlers(io);

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// CORS Middleware - Allow requests from frontend
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // Frontend URLs (React default: 3000, Next.js default: 3000)
    credentials: true,
  })
);

// Body Parser Middleware (allows us to read JSON data from the request body)
app.use(express.json());

// Import Route Files
const auth = require("./routes/auth");
const admin = require("./routes/admin");
const jobs = require("./routes/jobs");
const task = require("./routes/tasks");
const chat = require("./routes/chat");
const recommendations = require("./routes/recommendations");
const upload = require("./routes/upload");

// Mount Routers (Section 4.1)
app.use("/api/auth", auth);
app.use("/api/admin", admin);
app.use("/api/jobs", jobs);
app.use("/api/tasks", task);
app.use("/api/chat", chat);
app.use("/api/recommendations", recommendations);
app.use("/api/upload", upload);

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Error Handler Middleware (MUST be mounted after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5020;

server.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections (e.g., DB connection failures)
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
