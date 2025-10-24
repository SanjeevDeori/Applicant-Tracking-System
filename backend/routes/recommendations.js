// routes/recommendations.js

const express = require('express');
const { 
    getRecommendedJobs, 
    getRecommendedTasks 
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth'); 

const router = express.Router();

// All recommendation routes must be protected
router.use(protect);

router.route('/jobs')
    .get(getRecommendedJobs);

router.route('/tasks')
    .get(getRecommendedTasks);

module.exports = router;