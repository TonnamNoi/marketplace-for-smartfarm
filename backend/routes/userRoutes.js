const express = require("express");
const router = express.Router();
const {
  getUserById,
  updateUser,
  getAllProviders,
  upgradeToProvider,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

// Public routes
router.get("/providers", getAllProviders);
router.get("/:id", getUserById);

// Protected routes
router.put("/:id", authenticate, updateUser);
router.put("/:id/upgrade-to-provider", authenticate, upgradeToProvider);

module.exports = router;
