const { promisePool } = require("../config/database");

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * @route   GET /api/services
 * @desc    Get all services with optional filters and location-based sorting
 * @access  Public
 * @query   category_id, min_price, max_price, latitude, longitude, search, limit, offset
 */
const getAllServices = async (req, res) => {
  try {
    const {
      category_id,
      min_price,
      max_price,
      latitude,
      longitude,
      search,
      limit = 20,
      offset = 0,
    } = req.query;

    let query = `
      SELECT 
        s.*,
        u.name as provider_name,
        u.phone as provider_phone,
        u.is_verified as provider_verified,
        c.name as category_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.review_id) as review_count
      FROM services s
      INNER JOIN users u ON s.provider_id = u.user_id
      INNER JOIN categories c ON s.category_id = c.category_id
      LEFT JOIN reviews r ON s.service_id = r.service_id
      WHERE s.is_active = TRUE
    `;

    const params = [];

    // Filter by category
    if (category_id) {
      query += " AND s.category_id = ?";
      params.push(category_id);
    }

    // Filter by price range
    if (min_price) {
      query += " AND s.price >= ?";
      params.push(min_price);
    }
    if (max_price) {
      query += " AND s.price <= ?";
      params.push(max_price);
    }

    // Search by title or description
    if (search) {
      query += " AND (s.title LIKE ? OR s.description LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += " GROUP BY s.service_id";

    // Get services
    const [services] = await promisePool.query(query, params);

    // If user provides location, calculate distances and sort by nearest
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);

      services.forEach((service) => {
        if (service.latitude && service.longitude) {
          service.distance = calculateDistance(
            userLat,
            userLon,
            service.latitude,
            service.longitude
          );
        } else {
          service.distance = null;
        }
      });

      // Sort by distance (nearest first)
      services.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedServices = services.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedServices,
      meta: {
        total: services.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: endIndex < services.length,
      },
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get services",
    });
  }
};

/**
 * @route   GET /api/services/:id
 * @desc    Get single service by ID
 * @access  Public
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const [services] = await promisePool.query(
      `SELECT 
        s.*,
        u.name as provider_name,
        u.email as provider_email,
        u.phone as provider_phone,
        u.address as provider_address,
        u.bio as provider_bio,
        u.is_verified as provider_verified,
        u.profile_image as provider_image,
        c.name as category_name,
        c.description as category_description,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.review_id) as review_count
       FROM services s
       INNER JOIN users u ON s.provider_id = u.user_id
       INNER JOIN categories c ON s.category_id = c.category_id
       LEFT JOIN reviews r ON s.service_id = r.service_id
       WHERE s.service_id = ?
       GROUP BY s.service_id`,
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Get recent reviews for this service
    const [reviews] = await promisePool.query(
      `SELECT 
        r.*,
        u.name as customer_name
       FROM reviews r
       INNER JOIN users u ON r.customer_id = u.user_id
       WHERE r.service_id = ?
       ORDER BY r.created_at DESC
       LIMIT 5`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...services[0],
        recent_reviews: reviews,
      },
    });
  } catch (error) {
    console.error("Get service error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get service",
    });
  }
};

/**
 * @route   POST /api/services
 * @desc    Create new service (Provider only)
 * @access  Private (Provider)
 */
const createService = async (req, res) => {
  try {
    const {
      category_id,
      title,
      description,
      price,
      location,
      latitude,
      longitude,
      service_type = "fixed",
      duration_estimate,
    } = req.body;

    // Validate required fields
    if (!category_id || !title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide category, title, description, and price",
      });
    }

    // Insert service
    const [result] = await promisePool.query(
      `INSERT INTO services 
       (provider_id, category_id, title, description, price, location, latitude, longitude, service_type, duration_estimate) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        category_id,
        title,
        description,
        price,
        location,
        latitude || null,
        longitude || null,
        service_type,
        duration_estimate,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: {
        service_id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
  }
};

/**
 * @route   PUT /api/services/:id
 * @desc    Update service (Provider only - own services)
 * @access  Private (Provider)
 */
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      title,
      description,
      price,
      location,
      latitude,
      longitude,
      service_type,
      duration_estimate,
      is_active,
    } = req.body;

    // Check if service exists and belongs to user
    const [services] = await promisePool.query(
      "SELECT provider_id FROM services WHERE service_id = ?",
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (services[0].provider_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this service",
      });
    }

    // Update service
    await promisePool.query(
      `UPDATE services SET
        category_id = COALESCE(?, category_id),
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        location = COALESCE(?, location),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        service_type = COALESCE(?, service_type),
        duration_estimate = COALESCE(?, duration_estimate),
        is_active = COALESCE(?, is_active)
       WHERE service_id = ?`,
      [
        category_id,
        title,
        description,
        price,
        location,
        latitude,
        longitude,
        service_type,
        duration_estimate,
        is_active,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Service updated successfully",
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
  }
};

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete service (Provider only - own services)
 * @access  Private (Provider)
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service exists and belongs to user
    const [services] = await promisePool.query(
      "SELECT provider_id FROM services WHERE service_id = ?",
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (services[0].provider_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this service",
      });
    }

    // Delete service (cascade will handle bookings/reviews)
    await promisePool.query("DELETE FROM services WHERE service_id = ?", [id]);

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
};

/**
 * @route   GET /api/services/provider/:providerId
 * @desc    Get all services by a specific provider
 * @access  Public
 */
const getServicesByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    const [services] = await promisePool.query(
      `SELECT 
        s.*,
        c.name as category_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.review_id) as review_count
       FROM services s
       INNER JOIN categories c ON s.category_id = c.category_id
       LEFT JOIN reviews r ON s.service_id = r.service_id
       WHERE s.provider_id = ? AND s.is_active = TRUE
       GROUP BY s.service_id
       ORDER BY s.created_at DESC`,
      [providerId]
    );

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Get provider services error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get provider services",
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByProvider,
};
