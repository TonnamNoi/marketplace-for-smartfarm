const express = require("express");
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByProvider,
} = require("../controllers/serviceController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.get("/provider/:providerId", getServicesByProvider);

// Protected routes (Provider only)
router.post("/", authenticate, authorize("provider"), createService);
router.put("/:id", authenticate, authorize("provider"), updateService);
router.delete("/:id", authenticate, authorize("provider"), deleteService);

module.exports = router;
