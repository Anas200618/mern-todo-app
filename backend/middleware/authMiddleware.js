const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect private routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with "Bearer"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract token (remove "Bearer ")
      token = req.headers.authorization.split(" ")[1];

      // Verify token using secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user in DB and exclude password field
      const user = await User.findById(decoded.id).select("-password");

      // If user not found (edge case)
      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      // Attach user to request object
      req.user = user;

      // Continue to next middleware/controller
      next();
    } else {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token invalid",
    });
  }
};

module.exports = protect;