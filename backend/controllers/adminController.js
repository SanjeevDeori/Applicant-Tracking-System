// controllers/adminController.js

const User = require('../models/User');

// --- Helper Functions (Using the simple try/catch for now) ---

// @desc    Get all users (for Admin Dashboard)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
    try {
        // Retrieve all users excluding sensitive data like password
        const users = await User.find().select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Approve an Alumni account (Section 2.2)
// @route   PUT /api/admin/approve-alumni/:id
// @access  Private (Admin)
exports.approveAlumni = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: `User not found with id ${req.params.id}` });
        }

        if (user.role !== 'alumni') {
            return res.status(400).json({ success: false, error: `User ${req.params.id} is not an alumni account.` });
        }

        // Update the approval status
        user.isApproved = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Alumni account for ${user.fullName} has been approved.`,
            data: user.select('-password')
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get platform analytics (Section 3.6)
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res, next) => {
    try {
        // This is a basic example; MongoDB aggregation pipeline would be used for complex analytics
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const approvedAlumni = await User.countDocuments({ role: 'alumni', isApproved: true });
        
        // Mock data for Job/Task stats (will be real when those models are done)
        const activeJobs = 15; 
        const completedTasks = 42; 

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalStudents,
                totalAlumni,
                approvedAlumni,
                activeJobs,
                completedTasks
                // More metrics (e.g., job/task data, engagement) go here
            }
        });

    } catch (err) {
        next(err);
    }
};