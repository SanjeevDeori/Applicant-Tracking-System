// models/Job.js

const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    // --- Job Details (Posted by Admin/Approved Alumni) ---
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    skillsRequired: { // For Skill Matching Engine (SRF-3.4.1)
        type: [String],
        required: [true, 'Required skills are mandatory']
    },
    location: {
        type: String,
        default: 'Remote'
    },
    salaryRange: String,
    
    // --- Management Details ---
    postedBy: {
        // Reference to the User (Admin or Alumni) who posted the job
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    deadline: {
        type: Date,
        required: [true, 'Application deadline is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    // --- Application Tracking ---
    applications: [{
        user: {
            // Reference to the User (Student/Alumni) who applied
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        status: { // Application status tracking (SRF-3.2.3)
            type: String,
            enum: ['Pending', 'Shortlisted', 'Rejected'],
            default: 'Pending'
        },
        appliedDate: {
            type: Date,
            default: Date.now
        },
        // Optional: Admin notes on the application
        adminNotes: String
    }]
});

module.exports = mongoose.model('Job', JobSchema);