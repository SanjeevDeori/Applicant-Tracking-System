// middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Need the User model to find the user


// Protect routes: Verify token and attach user to the request
exports.protect = (async (req, res, next) => {
    let token;

    // Check if the token is present in the headers (standard practice: Bearer <token>)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        token = req.headers.authorization.split(' ')[1];
    } 
    // You could also check for a token in cookies if the frontend stores it there:
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route (No token)' });
    }

    try {
        // Verify token (uses the JWT_SECRET from .env)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by ID from the decoded payload
        // We select('-password') to ensure password hash is never retrieved
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
             return res.status(401).json({ success: false, error: 'Not authorized to access this route (User not found)' });
        }

        // For Alumni: ensure they are approved before allowing general access
        if (req.user.role === 'alumni' && !req.user.isApproved) {
            return res.status(403).json({ success: false, error: 'Alumni account is pending admin approval. Access denied.' });
        }

        next();
    } catch (err) {
        // Log the detailed error (e.g., token expired) for debugging
        console.error('JWT Verification Error:', err.message); 
        return res.status(401).json({ success: false, error: 'Not authorized to access this route (Token failed)' });
    }
});

// Grant access to specific roles (SRF-3.1.2: Role-Based Access Control)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};