// server.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error'); // The new middleware

// Load env variables (MUST be before connectDB)

require('dotenv').config();
// Connect to database
connectDB();

const app = express();

// Body Parser Middleware (allows us to read JSON data from the request body)
app.use(express.json());

// Import Route Files
const auth = require('./routes/auth');
const admin = require('./routes/admin');
const jobs = require('./routes/jobs');
const task = require('./routes/tasks');
const chat = require('./routes/chat');
const recommendations = require('./routes/recommendations');
// Mount Routers (Section 4.1)
app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/jobs', jobs);
app.use('/api/tasks', task);
app.use('/api/chat', chat);
app.use('/api/recommendations', recommendations);

// Error Handler Middleware (MUST be mounted after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5020;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections (e.g., DB connection failures)
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`.red.bold);
    // Close server & exit process
    server.close(() => process.exit(1));
});