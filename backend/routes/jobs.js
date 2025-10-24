// routes/jobs.js

const express = require('express');
const { 
    getJobs, 
    createJob, 
    applyForJob, 
    updateApplicationStatus 
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth'); // For security (SRF-3.1.2)

const router = express.Router();

// Publicly visible, but still requires auth to prevent unauthorized scraping
router.route('/').get(protect, getJobs); 

// Route for creating a job (Admin and Alumni only)
router.route('/')
    .post(protect, authorize('admin', 'alumni'), createJob); 

// Route for applying to a job (Students and Alumni only)
router.route('/:jobId/apply')
    .post(protect, authorize('student', 'alumni'), applyForJob);

// Route for updating application status (Admin only)
router.route('/:jobId/applications/:userId')
    .put(protect, authorize('admin'), updateApplicationStatus);

// TODO: Add PUT/DELETE routes for Admin/Alumni to manage their own postings

module.exports = router;