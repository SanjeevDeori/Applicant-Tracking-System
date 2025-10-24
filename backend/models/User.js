// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Sub-Schemas (Academic, Project, Certification - same as previous step) ---

// Schema for Detailed Marks (Supports up to 8/10 semesters/trimesters)
const SemesterMarkSchema = new mongoose.Schema({
    semester: { type: Number, required: true, min: 1 },
    sgpa: { type: Number, min: 0, max: 10, required: true },
    backlogs: { type: Number, default: 0 }
});

// Schema for Projects
const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [String],
    projectUrl: String,
});

// Schema for Certifications
const CertificationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    issuingOrganization: String,
    issueDate: Date,
    imageUrl: String, 
    credentialUrl: String 
});

// --- Main User Schema ---

const UserSchema = new mongoose.Schema({
    // 1. Core Identity and Contact
    firstName: { 
        type: String, 
        required: [true, 'Please add a first name'] 
    },
    middleName: { // Optional but good for formal records
        type: String 
    },
    lastName: { 
        type: String, 
        required: [true, 'Please add a last name'] 
    },
    email: { type: String, required: [true, 'Please add an email'], unique: true, 
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email']
    },
    password: { type: String, required: [true, 'Please add a password'], minlength: 6, select: false },
    mobileNumber: { type: String, required: [true, 'Please add a mobile number'], unique: true, minlength: 10, maxlength: 10 },
    alternateMobileNumber: { type: String, minlength: 10, maxlength: 10 },
    profileImageUrl: String,

    // 2. T&P and Role Management
    role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
    isApproved: { type: Boolean, default: false },

    // 3. Academic Details
    academicHistory: {
        grade10: { type: Number, min: 0, max: 100, required: true },
        grade12: { type: Number, min: 0, max: 100, required: true },
        courseName: String,
        courseStartDate: { type: Date, required: true },
        courseEndDate: Date,
        isCurrentlyEnrolled: { type: Boolean, default: true }
    },
    semesterMarks: [SemesterMarkSchema],
    overallCGPA: { type: Number, min: 0, max: 10 },
    
    // 4. Skills, Projects, and Achievements
    skills: { type: [String], default: [] },
    projects: [ProjectSchema],
    certifications: [CertificationSchema],
    extracurriculars: { type: [String], default: [] },
    
    // 5. System Data
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// --- Virtual Field: Calculate Full Name (Convenience) ---
// This virtual field allows easy access to the full name without hitting the DB
UserSchema.virtual('fullName').get(function() {
    let full = this.firstName;
    if (this.middleName) {
        full += ' ' + this.middleName;
    }
    full += ' ' + this.lastName;
    return full;
});

// --- Virtual Field: Calculate Current Academic Year (Student Specific) ---
UserSchema.virtual('currentAcademicYear').get(function() {
    if (this.role !== 'student' || !this.academicHistory.isCurrentlyEnrolled || !this.academicHistory.courseStartDate) {
        return null;
    }
    const startYear = this.academicHistory.courseStartDate.getFullYear();
    const currentYear = new Date().getFullYear();
    
    // Simple calculation: Current Year - Start Year + 1
    let academicYear = currentYear - startYear + 1;
    return academicYear > 0 ? academicYear : 1; 
});


// --- Mongoose Middleware (Security) ---

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- Model Methods (for Auth Controller) ---

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

module.exports = mongoose.model('User', UserSchema);