const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookingById,
  getCustomerBookings,
  getProviderBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// All booking routes require authentication
router.use(authenticate);

// Create booking (customers only)
router.post("/", authorize("customer"), createBooking);

// Get booking by ID
router.get("/:id", getBookingById);

// Get bookings by customer
router.get("/customer/:customerId", getCustomerBookings);

// Get bookings by provider
router.get("/provider/:providerId", getProviderBookings);

// Update booking status
router.put("/:id/status", updateBookingStatus);

module.exports = router;
