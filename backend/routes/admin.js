// routes/admin.js

const express = require('express');
const { getUsers, approveAlumni, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth'); // Import the new middleware

const router = express.Router();

// All routes here must be protected and restricted to 'admin' role
router.use(protect); // Ensure user is logged in
router.use(authorize('admin')); // Ensure user is an admin

// Route Definitions (Section 4.1)
router.route('/users').get(getUsers);
router.route('/approve-alumni/:id').put(approveAlumni);
router.route('/analytics').get(getAnalytics);

module.exports = router;