-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE reviews;
TRUNCATE TABLE bookings;
TRUNCATE TABLE services;
TRUNCATE TABLE users;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Categories
INSERT INTO categories (category_id, name, description, icon_url) VALUES
(1, 'Fertilization Services', 'Professional fertilization and soil enrichment services', NULL),
(2, 'Harvesting Services', 'Mechanical and manual harvesting assistance', NULL),
(3, 'Irrigation Services', 'Irrigation system installation and maintenance', NULL),
(4, 'Pest Control', 'Organic and chemical pest control solutions', NULL),
(5, 'Machinery Rental', 'Agricultural machinery and equipment rental', NULL),
(6, 'Soil Analysis', 'Professional soil testing and analysis services', NULL),
(7, 'Drone Services', 'Agricultural drone services for spraying and monitoring', NULL),
(8, 'IoT Installation', 'Smart farming technology and IoT sensor installation', NULL);

-- Insert Users (Password for all: "password123")
-- Password hash: $2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC

-- Customers (Farmers)
INSERT INTO users (user_id, name, email, password_hash, phone, role, address, latitude, longitude, bio, is_verified, created_at) VALUES
(1, 'Somchai Tanaka', 'somchai@farmer.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0812345678', 'customer', 'Pathum Thani, Thailand', 14.0208, 100.5250, NULL, 1, NOW()),
(2, 'Suwan Patel', 'suwan@farmer.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0823456789', 'customer', 'Ayutthaya, Thailand', 14.3532, 100.5779, NULL, 1, NOW()),
(3, 'Niran Kumar', 'niran@farmer.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0834567890', 'customer', 'Nakhon Pathom, Thailand', 13.8199, 100.0378, NULL, 1, NOW());

-- Providers (Service Providers)
INSERT INTO users (user_id, name, email, password_hash, phone, role, address, latitude, longitude, bio, portfolio_url, is_verified, created_at) VALUES
(4, 'Green Thumb Services', 'greenthumb@provider.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0845678901', 'provider', 'Bangkok, Thailand', 13.7563, 100.5018, 'Professional agricultural services with 10 years experience. Specializing in fertilization and pest control.', 'https://example.com/greenthumb', 1, NOW()),
(5, 'AgriTech Solutions', 'agritech@provider.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0856789012', 'provider', 'Nonthaburi, Thailand', 13.8591, 100.5258, 'Modern farming technology and IoT solutions provider. Installing smart sensors and automation systems.', 'https://example.com/agritech', 1, NOW()),
(6, 'Farm Assist Co.', 'farmassist@provider.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0867890123', 'provider', 'Pathum Thani, Thailand', 14.0105, 100.5290, 'Full-service agricultural support including harvesting, irrigation, and maintenance.', NULL, 1, NOW());

-- Insert Services
INSERT INTO services (service_id, provider_id, category_id, title, description, price, location, latitude, longitude, service_type, duration_estimate, is_active, created_at) VALUES
(1, 4, 1, 'Professional Fertilization Service', 'Complete fertilization service using organic and chemical fertilizers. Soil testing included.', 100.00, 'Bangkok and surrounding areas', 13.7563, 100.5018, 'per_acre', '2-3 hours', TRUE, NOW()),
(2, 4, 4, 'Organic Pest Control', 'Eco-friendly pest control using organic solutions. Safe for crops and environment.', 75.00, 'Bangkok Metropolitan', 13.7563, 100.5018, 'per_visit', '1-2 hours', TRUE, NOW()),
(3, 5, 8, 'IoT Sensor Installation', 'Installation of soil moisture, temperature, and humidity sensors with mobile app integration.', 350.00, 'Central Thailand', 13.8591, 100.5258, 'fixed', '4-6 hours', TRUE, NOW()),
(4, 5, 7, 'Agricultural Drone Spraying', 'Precision drone spraying for fertilizers and pesticides. Fast and efficient coverage.', 150.00, 'Nonthaburi and nearby provinces', 13.8591, 100.5258, 'per_acre', '1 hour', TRUE, NOW()),
(5, 6, 2, 'Mechanical Harvesting Service', 'Professional harvesting using modern machinery. Available for rice, corn, and vegetables.', 120.00, 'Pathum Thani Province', 14.0105, 100.5290, 'per_acre', '3-4 hours', TRUE, NOW()),
(6, 6, 3, 'Irrigation System Setup', 'Complete irrigation system installation including pipes, pumps, and timers.', 500.00, 'Pathum Thani and Bangkok', 14.0105, 100.5290, 'fixed', '1-2 days', TRUE, NOW());

-- Insert Sample Bookings
INSERT INTO bookings (booking_id, service_id, customer_id, provider_id, booking_date, scheduled_date, status, total_price, customer_notes, provider_response, payment_status, completed_at, created_at) VALUES
(1, 1, 1, 4, '2025-01-15 10:30:00', '2025-01-20 08:00:00', 'completed', 100.00, 'Need service for 1 acre rice field', 'Will arrive on time with all equipment', 'paid', '2025-01-20 11:30:00', '2025-01-15 10:30:00'),
(2, 5, 2, 6, '2025-01-18 14:20:00', '2025-01-25 07:00:00', 'accepted', 120.00, 'Corn field ready for harvest', 'Confirmed. Weather looks good for that day.', 'pending', NULL, '2025-01-18 14:20:00'),
(3, 3, 1, 5, '2025-01-22 09:15:00', '2025-01-30 09:00:00', 'pending', 350.00, 'Want to install 5 sensors', NULL, 'pending', NULL, '2025-01-22 09:15:00');

-- Insert Sample Review
INSERT INTO reviews (review_id, booking_id, service_id, customer_id, provider_id, rating, comment, communication_rating, quality_rating, timeliness_rating, provider_response, created_at) VALUES
(1, 1, 1, 1, 4, 5, 'Excellent service! Very professional and the results were amazing. My crops are growing much better now.', 5, 5, 5, 'Thank you for your kind words! Happy to help anytime.', '2025-01-21 15:00:00');

-- Insert Notifications
INSERT INTO notifications (notification_id, user_id, type, title, message, related_id, is_read, created_at) VALUES
(1, 4, 'new_booking', 'New Booking Request', 'You have a new booking request for your service', 1, TRUE, '2025-01-15 10:30:00'),
(2, 1, 'booking_accepted', 'Booking Accepted', 'Your booking has been accepted by the provider', 1, TRUE, '2025-01-15 11:00:00'),
(3, 4, 'new_review', 'New Review Received', 'You received a 5-star review', 1, TRUE, '2025-01-21 15:00:00'),
(4, 6, 'new_booking', 'New Booking Request', 'You have a new booking request for your service', 2, FALSE, '2025-01-18 14:20:00'),
(5, 5, 'new_booking', 'New Booking Request', 'You have a new booking request for your service', 3, FALSE, '2025-01-22 09:15:00');