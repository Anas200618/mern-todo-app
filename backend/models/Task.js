const mongoose = require("mongoose");

// Define subtask schema
const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Subtask title is required"],
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  }
});

// Define task schema
const taskSchema = new mongoose.Schema(
  {
    // Task title
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },

    // Optional description
    description: {
      type: String,
    },

    // Task status (default = not completed)
    completed: {
      type: Boolean,
      default: false,
    },

    // Link task to a specific user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User model
      required: true,
    },

    // Optional extra features
    dueDate: {
      type: Date,
    },
    category: {
      type: String,
    },

    // Additional fields commonly used on the frontend
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    tags: [
      {
        type: String,
        trim: true,
      }
    ],
    subtasks: [subtaskSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);