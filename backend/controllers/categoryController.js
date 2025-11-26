const { promisePool } = require("../config/database");

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
const getAllCategories = async (req, res) => {
  try {
    const [categories] = await promisePool.query(
      `SELECT 
        c.*,
        COUNT(s.service_id) as service_count
       FROM categories c
       LEFT JOIN services s ON c.category_id = s.category_id AND s.is_active = TRUE
       GROUP BY c.category_id
       ORDER BY c.name ASC`
    );

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get categories",
    });
  }
};

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [categories] = await promisePool.query(
      "SELECT * FROM categories WHERE category_id = ?",
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: categories[0],
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get category",
    });
  }
};

/**
 * @route   POST /api/categories
 * @desc    Create new category (Admin only)
 * @access  Private (Admin)
 */
const createCategory = async (req, res) => {
  try {
    const { name, description, icon_url } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check if category already exists
    const [existing] = await promisePool.query(
      "SELECT category_id FROM categories WHERE name = ?",
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const [result] = await promisePool.query(
      "INSERT INTO categories (name, description, icon_url) VALUES (?, ?, ?)",
      [name, description, icon_url]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        category_id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category (Admin only)
 * @access  Private (Admin)
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon_url } = req.body;

    // Check if category exists
    const [categories] = await promisePool.query(
      "SELECT category_id FROM categories WHERE category_id = ?",
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await promisePool.query(
      `UPDATE categories SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        icon_url = COALESCE(?, icon_url)
       WHERE category_id = ?`,
      [name, description, icon_url, id]
    );

    res.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (Admin only)
 * @access  Private (Admin)
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has services
    const [services] = await promisePool.query(
      "SELECT COUNT(*) as count FROM services WHERE category_id = ?",
      [id]
    );

    if (services[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with existing services",
      });
    }

    const [result] = await promisePool.query(
      "DELETE FROM categories WHERE category_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
