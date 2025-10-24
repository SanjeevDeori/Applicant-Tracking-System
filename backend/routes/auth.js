// routes/auth.js

const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Public routes for user onboarding
router.post('/register', register); // POST /api/auth/register
router.post('/login', login);       // POST /api/auth/login

module.exports = router;