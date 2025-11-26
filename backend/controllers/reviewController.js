const { promisePool } = require("../config/database");

/**
 * @route   POST /api/reviews
 * @desc    Create review for a completed booking (Customer only)
 * @access  Private (Customer)
 */
const createReview = async (req, res) => {
  try {
    const {
      booking_id,
      rating,
      comment,
      communication_rating,
      quality_rating,
      timeliness_rating,
    } = req.body;

    if (!booking_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Get booking details
    const [bookings] = await promisePool.query(
      "SELECT * FROM bookings WHERE booking_id = ?",
      [booking_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookings[0];

    // Check authorization (only customer can review)
    if (booking.customer_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the customer can leave a review",
      });
    }

    // Check if booking is completed
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only review completed bookings",
      });
    }

    // Check if review already exists
    const [existingReviews] = await promisePool.query(
      "SELECT review_id FROM reviews WHERE booking_id = ?",
      [booking_id]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Review already exists for this booking",
      });
    }

    // Create review
    const [result] = await promisePool.query(
      `INSERT INTO reviews 
       (booking_id, service_id, customer_id, provider_id, rating, comment, 
        communication_rating, quality_rating, timeliness_rating) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking_id,
        booking.service_id,
        booking.customer_id,
        booking.provider_id,
        rating,
        comment,
        communication_rating || null,
        quality_rating || null,
        timeliness_rating || null,
      ]
    );

    // Create notification for provider
    await promisePool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id) 
       VALUES (?, 'new_review', 'New Review Received', ?, ?)`,
      [
        booking.provider_id,
        `You received a ${rating}-star review`,
        result.insertId,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: {
        review_id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

/**
 * @route   GET /api/reviews/service/:serviceId
 * @desc    Get all reviews for a service
 * @access  Public
 */
const getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const [reviews] = await promisePool.query(
      `SELECT 
        r.*,
        u.name as customer_name,
        u.profile_image as customer_image
       FROM reviews r
       INNER JOIN users u ON r.customer_id = u.user_id
       WHERE r.service_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [serviceId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await promisePool.query(
      "SELECT COUNT(*) as total FROM reviews WHERE service_id = ?",
      [serviceId]
    );

    // Get average ratings
    const [avgResult] = await promisePool.query(
      `SELECT 
        AVG(rating) as avg_rating,
        AVG(communication_rating) as avg_communication,
        AVG(quality_rating) as avg_quality,
        AVG(timeliness_rating) as avg_timeliness
       FROM reviews
       WHERE service_id = ?`,
      [serviceId]
    );

    res.json({
      success: true,
      data: reviews,
      meta: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        averages: avgResult[0],
      },
    });
  } catch (error) {
    console.error("Get service reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
    });
  }
};

/**
 * @route   GET /api/reviews/provider/:providerId
 * @desc    Get all reviews for a provider
 * @access  Public
 */
const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const [reviews] = await promisePool.query(
      `SELECT 
        r.*,
        u.name as customer_name,
        u.profile_image as customer_image,
        s.title as service_title
       FROM reviews r
       INNER JOIN users u ON r.customer_id = u.user_id
       INNER JOIN services s ON r.service_id = s.service_id
       WHERE r.provider_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [providerId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await promisePool.query(
      "SELECT COUNT(*) as total FROM reviews WHERE provider_id = ?",
      [providerId]
    );

    // Get average ratings
    const [avgResult] = await promisePool.query(
      `SELECT 
        AVG(rating) as avg_rating,
        AVG(communication_rating) as avg_communication,
        AVG(quality_rating) as avg_quality,
        AVG(timeliness_rating) as avg_timeliness
       FROM reviews
       WHERE provider_id = ?`,
      [providerId]
    );

    res.json({
      success: true,
      data: reviews,
      meta: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        averages: avgResult[0],
      },
    });
  } catch (error) {
    console.error("Get provider reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
    });
  }
};

/**
 * @route   PUT /api/reviews/:id/response
 * @desc    Provider response to a review
 * @access  Private (Provider only)
 */
const respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { provider_response } = req.body;

    if (!provider_response) {
      return res.status(400).json({
        success: false,
        message: "Response text is required",
      });
    }

    // Get review
    const [reviews] = await promisePool.query(
      "SELECT provider_id FROM reviews WHERE review_id = ?",
      [id]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check authorization
    if (reviews[0].provider_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to respond to this review",
      });
    }

    // Update review with response
    await promisePool.query(
      "UPDATE reviews SET provider_response = ? WHERE review_id = ?",
      [provider_response, id]
    );

    res.json({
      success: true,
      message: "Response added successfully",
    });
  } catch (error) {
    console.error("Respond to review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to review",
    });
  }
};

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review (Customer only - own reviews)
 * @access  Private (Customer)
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Get review
    const [reviews] = await promisePool.query(
      "SELECT customer_id FROM reviews WHERE review_id = ?",
      [id]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check authorization
    if (reviews[0].customer_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    // Delete review
    await promisePool.query("DELETE FROM reviews WHERE review_id = ?", [id]);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

module.exports = {
  createReview,
  getServiceReviews,
  getProviderReviews,
  respondToReview,
  deleteReview,
};
