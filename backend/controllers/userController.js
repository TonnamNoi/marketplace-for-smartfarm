const { promisePool } = require("../config/database");

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Public
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await promisePool.query(
      `SELECT 
        user_id, name, email, phone, role, address, latitude, longitude,
        bio, portfolio_url, is_verified, profile_image, created_at
       FROM users
       WHERE user_id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // If user is a provider, get their stats
    if (user.role === "provider") {
      // Get service count
      const [serviceCount] = await promisePool.query(
        "SELECT COUNT(*) as count FROM services WHERE provider_id = ? AND is_active = TRUE",
        [id]
      );

      // Get average rating
      const [ratingData] = await promisePool.query(
        "SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE provider_id = ?",
        [id]
      );

      // Get completed bookings count
      const [bookingCount] = await promisePool.query(
        'SELECT COUNT(*) as count FROM bookings WHERE provider_id = ? AND status = "completed"',
        [id]
      );

      user.stats = {
        total_services: serviceCount[0].count,
        avg_rating: parseFloat(ratingData[0].avg_rating) || 0,
        total_reviews: ratingData[0].review_count,
        completed_jobs: bookingCount[0].count,
      };
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (Own profile only)
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is updating their own profile
    if (parseInt(id) !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      });
    }

    const { name, phone, address, latitude, longitude, bio, portfolio_url } =
      req.body;

    await promisePool.query(
      `UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        bio = COALESCE(?, bio),
        portfolio_url = COALESCE(?, portfolio_url)
       WHERE user_id = ?`,
      [name, phone, address, latitude, longitude, bio, portfolio_url, id]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

/**
 * @route   GET /api/users/providers
 * @desc    Get all service providers
 * @access  Public
 */
const getAllProviders = async (req, res) => {
  try {
    const { latitude, longitude, limit = 20, offset = 0 } = req.query;

    const [providers] = await promisePool.query(
      `SELECT 
        u.user_id, u.name, u.email, u.phone, u.address, u.latitude, u.longitude,
        u.bio, u.is_verified, u.profile_image,
        COUNT(DISTINCT s.service_id) as service_count,
        COUNT(DISTINCT b.booking_id) as completed_jobs,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.review_id) as review_count
       FROM users u
       LEFT JOIN services s ON u.user_id = s.provider_id AND s.is_active = TRUE
       LEFT JOIN bookings b ON u.user_id = b.provider_id AND b.status = 'completed'
       LEFT JOIN reviews r ON u.user_id = r.provider_id
       WHERE u.role = 'provider'
       GROUP BY u.user_id
       ORDER BY u.is_verified DESC, avg_rating DESC`
    );

    // If location provided, calculate distances
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);

      providers.forEach((provider) => {
        if (provider.latitude && provider.longitude) {
          const R = 6371; // Earth radius in km
          const dLat = ((provider.latitude - userLat) * Math.PI) / 180;
          const dLon = ((provider.longitude - userLon) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLat * Math.PI) / 180) *
              Math.cos((provider.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          provider.distance = R * c;
        } else {
          provider.distance = null;
        }
      });

      // Sort by distance
      providers.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProviders = providers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedProviders,
      meta: {
        total: providers.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error("Get providers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get providers",
    });
  }
};

/**
 * @route   PUT /api/users/:id/upgrade-to-provider
 * @desc    Upgrade customer account to provider
 * @access  Private (Own account only)
 */
const upgradeToProvider = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Check current role
    const [users] = await promisePool.query(
      "SELECT role FROM users WHERE user_id = ?",
      [id]
    );

    if (users[0].role === "provider") {
      return res.status(400).json({
        success: false,
        message: "Already a provider",
      });
    }

    // Upgrade to provider
    await promisePool.query(
      'UPDATE users SET role = "provider" WHERE user_id = ?',
      [id]
    );

    res.json({
      success: true,
      message: "Successfully upgraded to provider account",
    });
  } catch (error) {
    console.error("Upgrade to provider error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upgrade account",
    });
  }
};

module.exports = {
  getUserById,
  updateUser,
  getAllProviders,
  upgradeToProvider,
};
