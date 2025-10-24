// middleware/error.js

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    // Log to console for dev
    console.error(err.stack);

    // Mongoose Bad ObjectId (e.g., /api/users/123 instead of /api/users/654...)
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = { statusCode: 404, message };
    }

    // Mongoose Duplicate Key (e.g., registering with an existing email/mobile)
    if (err.code === 11000) {
        // Extract the field that caused the error (e.g., 'email' or 'mobileNumber')
        const field = Object.keys(err.keyValue).join(', ');
        const message = `Duplicate field value entered: ${field} must be unique.`;
        error = { statusCode: 400, message };
    }

    // Mongoose Validation Error (e.g., missing required field, bad email format)
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error = { statusCode: 400, message: messages.join(', ') };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = errorHandler;