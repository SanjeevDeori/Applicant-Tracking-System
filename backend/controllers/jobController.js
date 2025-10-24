// controllers/jobController.js

const Job = require('../models/Job');

// Helper to handle general errors (assumes asyncHandler or try/catch)

// @desc    Get all jobs and filtering (Student/Alumni view)
// @route   GET /api/jobs
// @access  Private (All authenticated users)
exports.getJobs = async (req, res, next) => {
    try {
        // Simple filtering example: jobs?skillsRequired=Node.js,Express.js
        let filter = {};
        if (req.query.skillsRequired) {
            // Find jobs where the skillsRequired array contains ANY of the provided skills
            const skillsArray = req.query.skillsRequired.split(',').map(s => s.trim());
            filter.skillsRequired = { $in: skillsArray };
        }
        
        const jobs = await Job.find(filter)
            .populate('postedBy', 'firstName lastName role') // Show who posted it
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Admin, Alumni)
exports.createJob = async (req, res, next) => {
    try {
        // The user ID comes from the JWT payload attached via the protect middleware
        req.body.postedBy = req.user.id; 
        
        // Ensure only Admin/Approved Alumni can post (handled by authorize middleware in routes)
        
        const job = await Job.create(req.body);

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Apply for a job (SRF-3.2.2)
// @route   POST /api/jobs/:jobId/apply
// @access  Private (Student, Alumni)
exports.applyForJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }
        
        // 1. Check if user already applied
        const alreadyApplied = job.applications.some(app => app.user.toString() === req.user.id);
        if (alreadyApplied) {
            return res.status(400).json({ success: false, error: 'You have already applied for this job.' });
        }

        // 2. Add application to the array
        job.applications.unshift({ user: req.user.id });
        await job.save();

        res.status(200).json({
            success: true,
            message: 'Application submitted successfully.',
            data: job
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update application status (SRF-3.2.3)
// @route   PUT /api/jobs/:jobId/applications/:userId
// @access  Private (Admin)
exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.jobId);
        
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }
        
        // Find the specific application
        const application = job.applications.find(app => app.user.toString() === req.params.userId);

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found for this user.' });
        }

        // Update the status (Pending, Shortlisted, Rejected)
        if (req.body.status) {
            application.status = req.body.status;
            await job.save();

            res.status(200).json({
                success: true,
                message: `Application status updated to ${req.body.status}`,
                data: job
            });
        } else {
            return res.status(400).json({ success: false, error: 'Please provide a status to update.' });
        }

    } catch (err) {
        next(err);
    }
};