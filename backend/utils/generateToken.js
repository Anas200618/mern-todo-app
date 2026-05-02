const jwt = require("jsonwebtoken");

// Function to generate JWT token
// It stores user id and role inside token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, // payload (data inside token)
    process.env.JWT_SECRET, // secret key
    { expiresIn: "7d" } // token validity
  );
};

module.exports = generateToken;