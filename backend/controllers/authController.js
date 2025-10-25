// controllers/authController.js

const User = require("../models/User");
// We need to wrap controller functions in an async handler to gracefully catch errors
// For simplicity here, we'll use basic try/catch blocks.

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      mobileNumber,
      // Academic fields
      grade10,
      grade12,
      courseName,
      courseStartDate,
    } = req.body;

    // Note: The password hashing is handled automatically by the User model's pre('save') hook.

    // 1. Create User with required academic fields
    let user = await User.create({
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      // Set role (default is 'student' if not provided)
      role: role === "alumni" ? "alumni" : "student",
      // Alumni requires admin approval, so we set isApproved based on role for registration
      isApproved: false, // Admins are approved immediately
      // Required academic fields - provide proper defaults
      academicHistory: {
        grade10: grade10 || 75, // Default to 75% if not provided
        grade12: grade12 || 75, // Default to 75% if not provided
        courseName: courseName || "Bachelor of Technology",
        courseStartDate: courseStartDate
          ? new Date(courseStartDate)
          : new Date(),
        isCurrentlyEnrolled: true,
      },
    });

    // 2. Send Response (Token)
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err); // Pass error to centralized handler
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Basic Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide an email and password",
      });
    }

    // 2. Check for user (must SELECT the password field explicitly)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // 3. Check password using the method defined in the User Model
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // 4. Alumni Approval Check (SRF-3.1.2)
    if (user.role === "alumni" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        error: "Alumni account pending admin approval. Access denied.",
      });
    }

    // 5. Send Response (Token)
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err); // Pass error to centralized handler
  }
};

// Helper function to send JWT token in the response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token using the method defined in the User Model
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    role: user.role,
    isApproved: user.isApproved,
  });
};
