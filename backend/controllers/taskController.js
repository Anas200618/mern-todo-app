const Task = require("../models/Task");

// ================= CREATE TASK =================
exports.createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      dueDate, 
      category, 
      priority, 
      tags, 
      subtasks 
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    // Create task linked to logged-in user
    const task = await Task.create({
      title,
      description,
      user: req.user._id,
      dueDate,
      category,
      priority,
      tags,
      subtasks,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= GET ALL TASKS =================
exports.getTasks = async (req, res) => {
  try {
    // Fetch only tasks of logged-in user
    const tasks = await Task.find({ user: req.user._id });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= UPDATE TASK =================
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this task",
      });
    }

    // Prevent marking already completed task again
    if (req.body.completed && task.completed) {
      return res.status(400).json({
        message: "Task already completed",
      });
    }

    // Update fields while preserving values if they are undefined in the request
    const fieldsToUpdate = [
      "title",
      "description",
      "completed",
      "dueDate",
      "category",
      "priority",
      "tags",
      "subtasks",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= DELETE TASK =================
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this task",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};