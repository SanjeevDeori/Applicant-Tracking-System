// routes/upload.js

const express = require("express");
const {
  uploadMultiple,
  handleUploadError,
  formatFileInfo,
} = require("../middleware/upload");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All upload routes must be protected
router.use(protect);

// @desc    Upload files for chat messages
// @route   POST /api/upload/chat
// @access  Private
router.post("/chat", uploadMultiple, handleUploadError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files uploaded.",
      });
    }

    const attachments = req.files.map((file) => formatFileInfo(file));

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully.",
      data: attachments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to upload files.",
    });
  }
});

module.exports = router;
