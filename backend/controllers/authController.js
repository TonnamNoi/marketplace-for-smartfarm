const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisePool } = require("../config/database");

/**
 * Generate JWT token
 */
const generateToken = (userId, email, role) => {
  return jwt.sign({ userId, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = "customer", // Default to customer
      address,
      latitude,
      longitude,
      bio,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Validate role
    if (!["customer", "provider"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "customer" or "provider"',
      });
    }

    // Check if user already exists
    const [existingUsers] = await promisePool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await promisePool.query(
      `INSERT INTO users (name, email, password_hash, phone, role, address, latitude, longitude, bio) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashedPassword,
        phone,
        role,
        address,
        latitude || null,
        longitude || null,
        bio || null,
      ]
    );

    // Generate token
    const token = generateToken(result.insertId, email, role);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        userId: result.insertId,
        name,
        email,
        role,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const [users] = await promisePool.query(
      "SELECT user_id, name, email, password_hash, role, phone, address, bio, is_verified FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user.user_id, user.email, user.role);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        isVerified: user.is_verified,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const [users] = await promisePool.query(
      `SELECT user_id, name, email, role, phone, address, latitude, longitude, 
              bio, portfolio_url, is_verified, profile_image, created_at 
       FROM users WHERE user_id = ?`,
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user info",
    });
  }
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    // Get current password hash
    const [users] = await promisePool.query(
      "SELECT password_hash FROM users WHERE user_id = ?",
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      currentPassword,
      users[0].password_hash
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await promisePool.query(
      "UPDATE users SET password_hash = ? WHERE user_id = ?",
      [hashedPassword, req.user.userId]
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
};
