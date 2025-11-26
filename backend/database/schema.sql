-- ============================================
-- Smart Farm Service Marketplace Database
-- ============================================

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'provider', 'admin') DEFAULT 'customer',
    
    -- Location fields (IMPORTANT for nearest provider search)
    address TEXT,
    latitude DECIMAL(10, 8),  -- For geolocation search
    longitude DECIMAL(11, 8), -- For geolocation search
    
    -- Provider-specific fields
    bio TEXT,                 -- Provider description
    portfolio_url VARCHAR(255), -- Link to work samples
    
    -- Metadata
    is_verified BOOLEAN DEFAULT FALSE,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_role (role),
    INDEX idx_location (latitude, longitude),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: services
-- ============================================
CREATE TABLE services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    category_id INT NOT NULL,
    
    -- Service details
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    
    -- Location (can differ from provider's default location)
    location VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Service attributes
    service_type ENUM('hourly', 'fixed', 'per_acre') DEFAULT 'fixed',
    duration_estimate VARCHAR(50), -- e.g., "2-3 hours", "1 day"
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Images
    image_url VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (provider_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    
    INDEX idx_provider (provider_id),
    INDEX idx_category (category_id),
    INDEX idx_location (latitude, longitude),
    INDEX idx_active (is_active),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: bookings
-- ============================================
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    
    -- Booking details
    booking_date DATETIME NOT NULL,
    scheduled_date DATETIME, -- When the service will be performed
    status ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Additional info
    customer_notes TEXT,      -- Special requests from customer
    provider_response TEXT,   -- Provider's response/notes
    
    -- Payment tracking (basic for now)
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (provider_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    
    INDEX idx_service (service_id),
    INDEX idx_customer (customer_id),
    INDEX idx_provider (provider_id),
    INDEX idx_status (status),
    INDEX idx_booking_date (booking_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: reviews
-- ============================================
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL,
    service_id INT NOT NULL,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    
    -- Review content
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    
    -- Detailed ratings (optional but useful)
    communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
    quality_rating INT CHECK (quality_rating BETWEEN 1 AND 5),
    timeliness_rating INT CHECK (timeliness_rating BETWEEN 1 AND 5),
    
    -- Provider can respond to review
    provider_response TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    INDEX idx_service (service_id),
    INDEX idx_provider (provider_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: notifications (Optional but recommended)
-- ============================================
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'booking_request', 'booking_accepted', 'new_review', etc.
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    related_id INT, -- booking_id, service_id, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
