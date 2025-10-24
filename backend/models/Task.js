// models/Task.js (Updated)

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    // --- Task Details ---
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Task description is required']
    },
    skillsRequired: { 
        type: [String],
        required: [true, 'Required skills for collaboration are mandatory']
    },
    category: {
        type: String,
        enum: ['Project Help', 'Assignment Assistance', 'Mentorship', 'Other'],
        default: 'Project Help'
    },
    
    // --- Management Details ---
    postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    status: { // Task status lifecycle: Open -> In Progress -> Completed
        type: String,
        enum: ['Open', 'In Progress', 'Completed', 'Canceled'],
        default: 'Open'
    },
    collaborator: { // NEW: The user who was finally selected to work on the task
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    
    // --- Application Tracking (NEW) ---
    applicants: [{
        user: { // Reference to the User who applied
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        appliedDate: {
            type: Date,
            default: Date.now
        },
        // Optional: Status could be added here (e.g., 'Selected', 'Rejected')
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);