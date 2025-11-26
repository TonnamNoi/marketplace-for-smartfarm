-- ============================================
-- Sample Data for Smart Farm Marketplace
-- ============================================

-- ============================================
-- INSERT CATEGORIES
-- ============================================
INSERT INTO categories (name, description) VALUES
('Fertilization', 'Professional fertilization and soil enrichment services'),
('Harvesting', 'Skilled workers for crop harvesting'),
('Irrigation', 'Irrigation system installation and maintenance'),
('Pest Control', 'Eco-friendly pest management solutions'),
('Machinery Rental', 'Tractors, harvesters, and other farm equipment'),
('Soil Analysis', 'Professional soil testing and analysis'),
('Drone Services', 'Aerial spraying and crop monitoring'),
('IoT Installation', 'Smart farming device installation');

-- ============================================
-- INSERT USERS
-- Password for all users: "password123" (hashed with bcrypt)
-- ============================================

-- Farmers (Customers)
INSERT INTO users (name, email, password_hash, phone, role, address, latitude, longitude, created_at) VALUES
('Somchai Farmer', 'somchai@farmer.com', '$2b$10$rH5MkZ.vQPXQxKxYJ9mLBe6YKxJ5Q0gLQqKwZwqWK3KZY8mY5mY5m', '081-234-5678', 'customer', 
 'Pathum Thani Province', 14.0208, 100.5250, NOW()),
 
('Noi Agricultural', 'noi@farm.com', '$2b$10$rH5MkZ.vQPXQxKxYJ9mLBe6YKxJ5Q0gLQqKwZwqWK3KZY8mY5mY5m', '082-345-6789', 'customer', 
 'Ayutthaya Province', 14.3532, 100.5779, NOW()),
 
('Chai Organic Farm', 'chai@organic.com', '$2b$10$rH5MkZ.vQPXQxKxYJ9mLBe6YKxJ5Q0gLQqKwZwqWK3KZY8mY5mY5m', '083-456-7890', 'customer', 
 'Nakhon Pathom Province', 13.8199, 100.0378, NOW());

-- Service Providers
INSERT INTO users (name, email, password_hash, phone, role, address, latitude, longitude, bio, is_verified, created_at) VALUES
('Green Thumb Services', 'greenthumb@provider.com', '$2b$10$rH5MkZ.vQPXQxKxYJ9mLBe6YKxJ5Q0gLQqKwZwqWK3KZY8mY5mY5m', '084-567-8901', 'provider',
 'Pathum Thani Province', 14.0275, 100.5300, 
 'Professional fertilization services with 10+ years experience. Specializing in organic and chemical treatments.',
 TRUE, NOW()),

('Harvest Masters Co.', 'harvest@masters.com', '$2b$10$rH5MkZ.vQPXQxKxYJ9mLBe6YKxJ5Q0gLQqKwZwqWK3KZY8mY5mY5m', '085-678-9012', 'provider',
 'Ayutthaya Province', 14.3600, 100.5800,
 'Expert harvesting team with modern equipment. Fast and efficient service for all crop types.',
 TRUE, NOW()),

('AquaTech Irrigation', 'aquatech@irrigation.com', '$2b$10$rH5MkZ.vQPXQxKxYJ9mLBe6YKxJ5Q0gLQqKwZwqWK3KZY8mY5mY5m', '086-789-0123', 'provider',
 'Nonthaburi Province', 13.8591, 100.5258,
 'Complete irrigation solutions - drip, sprinkler, and smart irrigation systems.',
 TRUE, NOW()),

('EcoPest Control', 'ecopest@control.com', '$2b$10$rH5MkZ.vQPXQxKxYJ9mLBe6YKxJ5Q0gLQqKwZwqWK3KZY8mY5mY5m', '087-890-1234', 'provider',
 'Bangkok', 13.7563, 100.5018,
 'Environmentally friendly pest control using organic methods. Safe for crops and soil.',
 TRUE, NOW()),

('FarmTech Machinery', 'farmtech@machinery.com', '$2b$10$rH5MkZ.vQPXQxKxYJ9mLBe6YKxJ5Q0gLQqKwZwqWK3KZY8mY5mY5m', '088-901-2345', 'provider',
 'Pathum Thani Province', 14.0100, 100.5200,
 'Modern farm equipment rental - tractors, harvesters, tillers, and more. Well-maintained machinery.',
 TRUE, NOW()),

('SkyView Drones', 'skyview@drones.com', '$2b$10$rH5MkZ.vQPXQxKxYJ9mLBe6YKxJ5Q0gLQqKwZwqWK3KZY8mY5mY5m', '089-012-3456', 'provider',
 'Nakhon Pathom Province', 13.8250, 100.0400,
 'Professional drone spraying and aerial crop monitoring services.',
 TRUE, NOW());

-- Admin
INSERT INTO users (name, email, password_hash, phone, role, created_at) VALUES
('System Admin', 'admin@smartfarm.com', '$2b$10$rH5MkZ.vQPXQxKxYJ9mLBe6YKxJ5Q0gLQqKwZwqWK3KZY8mY5mY5m', '090-123-4567', 'admin', NOW());

-- ============================================
-- INSERT SERVICES
-- ============================================

-- Fertilization Services
INSERT INTO services (provider_id, category_id, title, description, price, location, latitude, longitude, service_type, duration_estimate, is_active) VALUES
(4, 1, 'Professional Fertilization Delivery', 
 'High-quality fertilization service for all crop types. We use premium organic and chemical fertilizers based on your soil needs.',
 100.00, 'Pathum Thani', 14.0275, 100.5300, 'per_acre', '2-3 hours per acre', TRUE),

(4, 1, 'Organic Soil Enrichment',
 'Natural soil enrichment using compost and organic materials. Perfect for organic farming.',
 120.00, 'Pathum Thani', 14.0275, 100.5300, 'per_acre', '3-4 hours per acre', TRUE);

-- Harvesting Services
INSERT INTO services (provider_id, category_id, title, description, price, location, latitude, longitude, service_type, duration_estimate, is_active) VALUES
(5, 2, 'Professional Harvesting Service',
 'Skilled workers with modern tools to harvest your crops efficiently and on time. Suitable for rice, vegetables, and fruits.',
 15.00, 'Ayutthaya', 14.3600, 100.5800, 'hourly', '8 hours minimum', TRUE),

(5, 2, 'Emergency Harvest Team',
 'Fast-response harvesting team for urgent situations. Available within 24 hours.',
 20.00, 'Ayutthaya', 14.3600, 100.5800, 'hourly', 'Flexible', TRUE);

-- Irrigation Services
INSERT INTO services (provider_id, category_id, title, description, price, location, latitude, longitude, service_type, duration_estimate, is_active) VALUES
(6, 3, 'Drip Irrigation System Installation',
 'Complete installation of modern drip irrigation systems. Water-efficient and suitable for all farm sizes.',
 300.00, 'Nonthaburi', 13.8591, 100.5258, 'fixed', '1-2 days', TRUE),

(6, 3, 'Sprinkler System Setup',
 'Professional sprinkler irrigation system installation with automatic timers.',
 350.00, 'Nonthaburi', 13.8591, 100.5258, 'fixed', '2-3 days', TRUE),

(6, 3, 'Irrigation System Maintenance',
 'Regular maintenance and repair service for existing irrigation systems.',
 80.00, 'Nonthaburi', 13.8591, 100.5258, 'fixed', '2-4 hours', TRUE);

-- Pest Control Services
INSERT INTO services (provider_id, category_id, title, description, price, location, latitude, longitude, service_type, duration_estimate, is_active) VALUES
(7, 4, 'Eco-Friendly Pest Control',
 'Organic pest management solutions that are safe for your crops, soil, and the environment.',
 50.00, 'Bangkok', 13.7563, 100.5018, 'fixed', '1-2 hours', TRUE),

(7, 4, 'Integrated Pest Management',
 'Comprehensive pest control program using biological and chemical methods.',
 75.00, 'Bangkok', 13.7563, 100.5018, 'fixed', '2-3 hours', TRUE);

-- Machinery Rental
INSERT INTO services (provider_id, category_id, title, description, price, location, latitude, longitude, service_type, duration_estimate, is_active) VALUES
(8, 5, 'Tractor Rental with Operator',
 'Modern tractors available for plowing, tilling, and other farm operations. Includes experienced operator.',
 200.00, 'Pathum Thani', 14.0100, 100.5200, 'fixed', 'Per day', TRUE),

(8, 5, 'Harvesting Machine Rental',
 'Professional harvesting machines for rice and other crops. Efficient and fast.',
 250.00, 'Pathum Thani', 14.0100, 100.5200, 'fixed', 'Per day', TRUE),

(8, 5, 'Rotary Tiller Rental',
 'Rotary tillers for soil preparation. Well-maintained equipment.',
 120.00, 'Pathum Thani', 14.0100, 100.5200, 'fixed', 'Per day', TRUE);

-- Drone Services
INSERT INTO services (provider_id, category_id, title, description, price, location, latitude, longitude, service_type, duration_estimate, is_active) VALUES
(9, 7, 'Drone Crop Spraying',
 'Professional drone spraying service for pesticides and fertilizers. Fast and precise coverage.',
 150.00, 'Nakhon Pathom', 13.8250, 100.0400, 'per_acre', '30 minutes per acre', TRUE),

(9, 7, 'Aerial Crop Monitoring',
 'Drone-based crop health monitoring with detailed reports and images.',
 100.00, 'Nakhon Pathom', 13.8250, 100.0400, 'fixed', '1 hour', TRUE);

-- ============================================
-- INSERT SAMPLE BOOKINGS
-- ============================================

-- Completed booking with review
INSERT INTO bookings (service_id, customer_id, provider_id, booking_date, scheduled_date, status, total_price, customer_notes, payment_status, completed_at) VALUES
(1, 1, 4, '2025-01-10 10:00:00', '2025-01-15 08:00:00', 'completed', 500.00, 
 'Need fertilization for 5 acres of rice paddy. Prefer organic if possible.',
 'paid', '2025-01-15 12:00:00');

-- Active booking (accepted)
INSERT INTO bookings (service_id, customer_id, provider_id, booking_date, scheduled_date, status, total_price, customer_notes, payment_status) VALUES
(5, 2, 6, '2025-01-20 14:30:00', '2025-01-25 07:00:00', 'accepted', 300.00,
 'Installing drip irrigation for vegetable farm. 1 acre area.',
 'pending');

-- Pending booking
INSERT INTO bookings (service_id, customer_id, provider_id, booking_date, scheduled_date, status, total_price, customer_notes, payment_status) VALUES
(10, 3, 8, '2025-01-22 09:00:00', '2025-01-28 06:00:00', 'pending', 200.00,
 'Need tractor for plowing 2 acres. Soil is slightly rocky.',
 'pending');

-- ============================================
-- INSERT SAMPLE REVIEW
-- ============================================

INSERT INTO reviews (booking_id, service_id, customer_id, provider_id, rating, comment, communication_rating, quality_rating, timeliness_rating) VALUES
(1, 1, 1, 4, 5, 
 'Excellent service! Very professional team. The fertilization was done perfectly and my crops are growing very well. Highly recommend!',
 5, 5, 5);

-- ============================================
-- INSERT SAMPLE NOTIFICATIONS
-- ============================================

INSERT INTO notifications (user_id, type, title, message, related_id, is_read) VALUES
(4, 'new_booking', 'New Booking Request', 'You have a new booking request from Somchai Farmer', 1, TRUE),
(1, 'booking_accepted', 'Booking Accepted', 'Your booking has been accepted by Green Thumb Services', 1, TRUE),
(1, 'service_completed', 'Service Completed', 'Your service has been marked as completed. Please leave a review!', 1, TRUE),
(2, 'booking_accepted', 'Booking Accepted', 'Your irrigation installation booking has been accepted', 2, FALSE),
(8, 'new_booking', 'New Booking Request', 'New tractor rental request from Chai Organic Farm', 3, FALSE);
