// controllers/recommendationController.js

const Job = require('../models/Job');
const Task = require('../models/Task');
const User = require('../models/User'); // Needed for user's own profile/skills

// Helper function to calculate a simple skill overlap score
const calculateOverlapScore = (userSkills, requiredSkills) => {
    if (!userSkills || !requiredSkills || userSkills.length === 0 || requiredSkills.length === 0) {
        return 0;
    }
    
    const userSkillSet = new Set(userSkills.map(s => s.toLowerCase()));
    let matchedCount = 0;
    
    // Count how many required skills the user possesses
    requiredSkills.forEach(requiredSkill => {
        if (userSkillSet.has(requiredSkill.toLowerCase())) {
            matchedCount++;
        }
    });
    
    // Score is the percentage of required skills the user has (out of 100)
    // Formula: (matchedCount / totalRequiredSkills) * 100
    return Math.round((matchedCount / requiredSkills.length) * 100);
};


// @desc    Get recommended jobs based on user skills (SRF-3.4.1, 3.4.2)
// @route   GET /api/recommendations/jobs
// @access  Private (All authenticated users)
exports.getRecommendedJobs = async (req, res, next) => {
    try {
        const userSkills = req.user.skills;
        
        if (!userSkills || userSkills.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: "Please update your profile skills for recommendations.", 
                data: [] 
            });
        }
        
        // 1. Fetch relevant jobs: Find all jobs that require at least one skill the user has
        const relevantJobs = await Job.find({ 
            skillsRequired: { $in: userSkills } 
        })
        .populate('postedBy', 'firstName lastName company')
        .lean(); // Use .lean() for faster processing

        // 2. Score and Rank the jobs
        const scoredJobs = relevantJobs.map(job => {
            const score = calculateOverlapScore(userSkills, job.skillsRequired);
            return {
                ...job,
                matchScore: score 
            };
        });

        // 3. Sort by matchScore (highest score first)
        scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json({
            success: true,
            count: scoredJobs.length,
            data: scoredJobs
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get recommended tasks based on user skills (SRF-3.4.1, 3.4.2)
// @route   GET /api/recommendations/tasks
// @access  Private (All authenticated users)
exports.getRecommendedTasks = async (req, res, next) => {
    try {
        const userSkills = req.user.skills;
        
        if (!userSkills || userSkills.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: "Please update your profile skills for recommendations.", 
                data: [] 
            });
        }

        // 1. Fetch relevant tasks: Find open tasks that require at least one skill the user has
        const relevantTasks = await Task.find({ 
            skillsRequired: { $in: userSkills },
            status: 'Open',
            postedBy: { $ne: req.user.id } // Don't recommend tasks the user posted
        })
        .populate('postedBy', 'firstName lastName profileImageUrl')
        .lean(); 

        // 2. Score and Rank the tasks
        const scoredTasks = relevantTasks.map(task => {
            const score = calculateOverlapScore(userSkills, task.skillsRequired);
            return {
                ...task,
                matchScore: score 
            };
        });

        // 3. Sort by matchScore (highest score first)
        scoredTasks.sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json({
            success: true,
            count: scoredTasks.length,
            data: scoredTasks
        });
    } catch (err) {
        next(err);
    }
};