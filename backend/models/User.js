// Import mongoose to create schema
const mongoose = require("mongoose");

// Define user schema
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: [true, "Name is required"], // validation with message
      trim: true,
    },

    // User email (must be unique)
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },

    // Hashed password (never store plain password)
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    // Role-based access (admin or normal user)
    role: {
      type: String,
      enum: ["user", "admin"], // only these values allowed
      default: "user",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// Export model
module.exports = mongoose.model("User", userSchema);