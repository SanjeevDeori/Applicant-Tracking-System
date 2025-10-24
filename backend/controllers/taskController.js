// controllers/taskController.js (Updated Logic)

const Task = require('../models/Task');

// @desc    Get all open tasks (Student/Alumni view)
// @route   GET /api/tasks
// @access  Private (All authenticated users)
exports.getTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({ status: 'Open' })
            .populate('postedBy', 'firstName lastName role profileImageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new task/collaboration request
// @route   POST /api/tasks
// @access  Private (Student, Alumni)
exports.createTask = async (req, res, next) => {
    try {
        req.body.postedBy = req.user.id; 
        
        const task = await Task.create(req.body);

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (err) {
        next(err);
    }
};

// @desc    User applies for a task (Replaces acceptTask)
// @route   POST /api/tasks/:taskId/apply
// @access  Private (Student, Alumni)
exports.applyForTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }
        
        // Cannot apply for your own task
        if (task.postedBy.toString() === req.user.id) {
             return res.status(400).json({ success: false, error: 'Cannot apply for a task you posted.' });
        }
        
        // Check if user already applied
        const alreadyApplied = task.applicants.some(app => app.user.toString() === req.user.id);
        if (alreadyApplied) {
            return res.status(400).json({ success: false, error: 'You have already applied for this task.' });
        }
        
        // Add application to the applicants array
        task.applicants.unshift({ user: req.user.id });
        await task.save();

        res.status(200).json({
            success: true,
            message: 'Application submitted successfully.',
            data: task
        });
    } catch (err) {
        next(err);
    }
};


// @desc    Task Poster views applications (populate full user details)
// @route   GET /api/tasks/:taskId/applicants
// @access  Private (Task Poster only)
exports.viewApplicants = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.taskId)
            .populate('applicants.user', 'firstName lastName email skills overallCGPA'); // Populate details
        
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }
        
        // Authorization: Must be the user who posted the task
        if (task.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to view applicants for this task.' });
        }

        res.status(200).json({
            success: true,
            count: task.applicants.length,
            data: task.applicants
        });

    } catch (err) {
        next(err);
    }
};


// @desc    Task Poster assigns a collaborator from the applicant list
// @route   PUT /api/tasks/:taskId/assign/:userId
// @access  Private (Task Poster only)
exports.assignCollaborator = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }
        
        // Authorization: Must be the user who posted the task
        if (task.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to assign a collaborator for this task.' });
        }

        // Check if the applicant is valid
        const applicantExists = task.applicants.some(app => app.user.toString() === req.params.userId);
        if (!applicantExists) {
            return res.status(400).json({ success: false, error: 'The specified user did not apply for this task.' });
        }

        // Assign collaborator and update status
        task.collaborator = req.params.userId;
        task.status = 'In Progress';
        // Clear the applicants array once a collaborator is selected
        task.applicants = []; 
        await task.save();

        res.status(200).json({
            success: true,
            message: `Collaborator ${req.params.userId} assigned and task is now In Progress.`,
            data: task
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Mark task as completed (Logic remains mostly the same)
// @route   PUT /api/tasks/:taskId/complete
// @access  Private (PostedBy or Collaborator)
exports.completeTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Authorization: Only the poster OR the assigned collaborator can mark it complete
        if (task.postedBy.toString() !== req.user.id && task.collaborator.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to complete this task.' });
        }

        task.status = 'Completed'; 
        await task.save();

        res.status(200).json({
            success: true,
            message: 'Task marked as Completed.',
            data: task
        });

    } catch (err) {
        next(err);
    }
};