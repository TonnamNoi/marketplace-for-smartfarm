const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin only routes
router.post("/", authenticate, authorize("admin"), createCategory);
router.put("/:id", authenticate, authorize("admin"), updateCategory);
router.delete("/:id", authenticate, authorize("admin"), deleteCategory);

module.exports = router;
