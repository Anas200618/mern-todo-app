// Load environment variables
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors"); // ✅ ADD THIS

const app = express();

// ================= MIDDLEWARE =================

// ✅ ENABLE CORS (VERY IMPORTANT)
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);

// Parse JSON
app.use(express.json());

// ================= DATABASE =================
connectDB();

// ================= ROUTES =================

app.get("/", (req, res) => {
  res.send("API Running");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});