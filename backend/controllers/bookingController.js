const { promisePool } = require("../config/database");

/**
 * @route   POST /api/bookings
 * @desc    Create new booking (Customer only)
 * @access  Private (Customer)
 */
const createBooking = async (req, res) => {
  try {
    const { service_id, scheduled_date, customer_notes } = req.body;

    if (!service_id || !scheduled_date) {
      return res.status(400).json({
        success: false,
        message: "Service ID and scheduled date are required",
      });
    }

    // Get service details
    const [services] = await promisePool.query(
      "SELECT provider_id, price FROM services WHERE service_id = ? AND is_active = TRUE",
      [service_id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found or inactive",
      });
    }

    const { provider_id, price } = services[0];

    // Create booking
    const [result] = await promisePool.query(
      `INSERT INTO bookings 
       (service_id, customer_id, provider_id, booking_date, scheduled_date, total_price, customer_notes, status) 
       VALUES (?, ?, ?, NOW(), ?, ?, ?, 'pending')`,
      [
        service_id,
        req.user.userId,
        provider_id,
        scheduled_date,
        price,
        customer_notes,
      ]
    );

    // Create notification for provider
    await promisePool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id) 
       VALUES (?, 'new_booking', 'New Booking Request', ?, ?)`,
      [
        provider_id,
        `You have a new booking request for your service`,
        result.insertId,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        booking_id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking by ID
 * @access  Private (Customer or Provider involved)
 */
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        s.title as service_title,
        s.description as service_description,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        p.name as provider_name,
        p.email as provider_email,
        p.phone as provider_phone
       FROM bookings b
       INNER JOIN services s ON b.service_id = s.service_id
       INNER JOIN users c ON b.customer_id = c.user_id
       INNER JOIN users p ON b.provider_id = p.user_id
       WHERE b.booking_id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    // Check authorization
    if (
      booking.customer_id !== req.user.userId &&
      booking.provider_id !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get booking",
    });
  }
};

/**
 * @route   GET /api/bookings/customer/:customerId
 * @desc    Get all bookings for a customer
 * @access  Private (Own bookings only)
 */
const getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check authorization
    if (parseInt(customerId) !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        s.title as service_title,
        p.name as provider_name,
        p.phone as provider_phone
       FROM bookings b
       INNER JOIN services s ON b.service_id = s.service_id
       INNER JOIN users p ON b.provider_id = p.user_id
       WHERE b.customer_id = ?
       ORDER BY b.created_at DESC`,
      [customerId]
    );

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get customer bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get bookings",
    });
  }
};

/**
 * @route   GET /api/bookings/provider/:providerId
 * @desc    Get all bookings for a provider
 * @access  Private (Own bookings only)
 */
const getProviderBookings = async (req, res) => {
  try {
    const { providerId } = req.params;

    // Check authorization
    if (parseInt(providerId) !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const [bookings] = await promisePool.query(
      `SELECT 
        b.*,
        s.title as service_title,
        c.name as customer_name,
        c.phone as customer_phone
       FROM bookings b
       INNER JOIN services s ON b.service_id = s.service_id
       INNER JOIN users c ON b.customer_id = c.user_id
       WHERE b.provider_id = ?
       ORDER BY b.created_at DESC`,
      [providerId]
    );

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get provider bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get bookings",
    });
  }
};

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update booking status
 * @access  Private (Provider can accept/reject, Customer can cancel, Both can complete)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, provider_response } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Validate status
    const validStatuses = [
      "pending",
      "accepted",
      "rejected",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Get booking
    const [bookings] = await promisePool.query(
      "SELECT * FROM bookings WHERE booking_id = ?",
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    // Authorization checks
    if (status === "accepted" || status === "rejected") {
      // Only provider can accept/reject
      if (booking.provider_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "Only the provider can accept or reject bookings",
        });
      }
    } else if (status === "cancelled") {
      // Only customer can cancel
      if (booking.customer_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "Only the customer can cancel bookings",
        });
      }
    } else if (status === "completed") {
      // Either party can mark as completed (but typically provider)
      if (
        booking.customer_id !== req.user.userId &&
        booking.provider_id !== req.user.userId
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized",
        });
      }
    }

    // Update booking
    const updateFields = [status];
    let query = "UPDATE bookings SET status = ?";

    if (provider_response) {
      query += ", provider_response = ?";
      updateFields.push(provider_response);
    }

    if (status === "completed") {
      query += ', completed_at = NOW(), payment_status = "paid"';
    }

    query += " WHERE booking_id = ?";
    updateFields.push(id);

    await promisePool.query(query, updateFields);

    // Create notification
    let notificationMessage = "";
    let notificationTitle = "";
    let recipientId = null;

    if (status === "accepted") {
      recipientId = booking.customer_id;
      notificationTitle = "Booking Accepted";
      notificationMessage = "Your booking has been accepted by the provider";
    } else if (status === "rejected") {
      recipientId = booking.customer_id;
      notificationTitle = "Booking Rejected";
      notificationMessage = "Your booking has been rejected";
    } else if (status === "completed") {
      recipientId = booking.customer_id;
      notificationTitle = "Service Completed";
      notificationMessage =
        "The service has been completed. Please leave a review!";
    } else if (status === "cancelled") {
      recipientId = booking.provider_id;
      notificationTitle = "Booking Cancelled";
      notificationMessage = "The customer has cancelled the booking";
    }

    if (recipientId) {
      await promisePool.query(
        `INSERT INTO notifications (user_id, type, title, message, related_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          recipientId,
          `booking_${status}`,
          notificationTitle,
          notificationMessage,
          id,
        ]
      );
    }

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getCustomerBookings,
  getProviderBookings,
  updateBookingStatus,
};
