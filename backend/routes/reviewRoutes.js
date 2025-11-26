const express = require("express");
const router = express.Router();
const {
  createReview,
  getServiceReviews,
  getProviderReviews,
  respondToReview,
  deleteReview,
} = require("../controllers/reviewController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/service/:serviceId", getServiceReviews);
router.get("/provider/:providerId", getProviderReviews);

// Protected routes
router.post("/", authenticate, authorize("customer"), createReview);
router.put(
  "/:id/response",
  authenticate,
  authorize("provider"),
  respondToReview
);
router.delete("/:id", authenticate, authorize("customer"), deleteReview);

module.exports = router;
