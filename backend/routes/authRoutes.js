const express = require("express");
const router = express.Router();

// Import controller functions
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/authController");

// Import middleware
const protect = require("../middleware/authMiddleware");

// ================= PUBLIC ROUTES =================

// Register new user
// POST /api/auth/register
router.post("/register", registerUser);

// Login user
// POST /api/auth/login
router.post("/login", loginUser);

// ================= PROTECTED ROUTES =================

// Get logged-in user profile
// GET /api/auth/profile
router.get("/profile", protect, getProfile);

module.exports = router;