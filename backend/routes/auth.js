// routes/auth.js

const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes for user onboarding
router.post('/register', register); // POST /api/auth/register
router.post('/login', login);       // POST /api/auth/login

// Protected route to get current user
router.get('/me', protect, getMe);  // GET /api/auth/me

module.exports = router;