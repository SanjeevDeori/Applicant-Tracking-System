// routes/tasks.js (Updated)

const express = require('express');
const { 
    getTasks, 
    createTask, 
    applyForTask, // NEW
    viewApplicants, // NEW
    assignCollaborator, // NEW
    completeTask 
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth'); 

const router = express.Router();

// All Task routes require protection

// General access for viewing and creation
router.route('/')
    .get(protect, getTasks)
    .post(protect, authorize('student', 'alumni'), createTask);

// Actions by Applicants
router.route('/:taskId/apply') // Task application route
    .post(protect, authorize('student', 'alumni'), applyForTask);

// Actions by Task Poster
router.route('/:taskId/applicants') // View all applicants for a specific task
    .get(protect, viewApplicants);

router.route('/:taskId/assign/:userId') // Task poster selects a collaborator
    .put(protect, assignCollaborator); // Protect only, internal logic handles authorization

router.route('/:taskId/complete')
    .put(protect, completeTask);

module.exports = router;