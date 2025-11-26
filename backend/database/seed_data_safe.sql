-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Delete existing data (safer than TRUNCATE)
DELETE FROM notifications;
DELETE FROM reviews;
DELETE FROM bookings;
DELETE FROM services;
DELETE FROM users WHERE user_id != (SELECT MAX(user_id) FROM (SELECT user_id FROM users WHERE email = 'test@example.com') as temp);
DELETE FROM categories;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE services AUTO_INCREMENT = 1;
ALTER TABLE bookings AUTO_INCREMENT = 1;
ALTER TABLE reviews AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;

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
-- Customers (Farmers)
INSERT INTO users (name, email, password_hash, phone, role, address, latitude, longitude, bio, is_verified, created_at) VALUES
('Somchai Tanaka', 'somchai@farmer.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0812345678', 'customer', 'Pathum Thani, Thailand', 14.0208, 100.5250, NULL, 1, NOW()),
('Suwan Patel', 'suwan@farmer.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0823456789', 'customer', 'Ayutthaya, Thailand', 14.3532, 100.5779, NULL, 1, NOW()),
('Niran Kumar', 'niran@farmer.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0834567890', 'customer', 'Nakhon Pathom, Thailand', 13.8199, 100.0378, NULL, 1, NOW());

-- Providers (Service Providers)
INSERT INTO users (name, email, password_hash, phone, role, address, latitude, longitude, bio, portfolio_url, is_verified, created_at) VALUES
('Green Thumb Services', 'greenthumb@provider.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0845678901', 'provider', 'Bangkok, Thailand', 13.7563, 100.5018, 'Professional agricultural services with 10 years experience. Specializing in fertilization and pest control.', 'https://example.com/greenthumb', 1, NOW()),
('AgriTech Solutions', 'agritech@provider.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0856789012', 'provider', 'Nonthaburi, Thailand', 13.8591, 100.5258, 'Modern farming technology and IoT solutions provider. Installing smart sensors and automation systems.', 'https://example.com/agritech', 1, NOW()),
('Farm Assist Co.', 'farmassist@provider.com', '$2b$10$rK7XU5bLm5Cv3OLhGqPWj.VXhZ0vZ0n6YGd8bCZGQKFvL.tXE2YxC', '0867890123', 'provider', 'Pathum Thani, Thailand', 14.0105, 100.5290, 'Full-service agricultural support including harvesting, irrigation, and maintenance.', NULL, 1, NOW());

-- Get the auto-generated user IDs for foreign keys
SET @customer1_id = (SELECT user_id FROM users WHERE email = 'somchai@farmer.com');
SET @customer2_id = (SELECT user_id FROM users WHERE email = 'suwan@farmer.com');
SET @customer3_id = (SELECT user_id FROM users WHERE email = 'niran@farmer.com');
SET @provider1_id = (SELECT user_id FROM users WHERE email = 'greenthumb@provider.com');
SET @provider2_id = (SELECT user_id FROM users WHERE email = 'agritech@provider.com');
SET @provider3_id = (SELECT user_id FROM users WHERE email = 'farmassist@provider.com');

-- Insert Services
INSERT INTO services (provider_id, category_id, title, description, price, location, latitude, longitude, service_type, duration_estimate, is_active, created_at) VALUES
(@provider1_id, 1, 'Professional Fertilization Service', 'Complete fertilization service using organic and chemical fertilizers. Soil testing included.', 100.00, 'Bangkok and surrounding areas', 13.7563, 100.5018, 'per_acre', '2-3 hours', TRUE, NOW()),
(@provider1_id, 4, 'Organic Pest Control', 'Eco-friendly pest control using organic solutions. Safe for crops and environment.', 75.00, 'Bangkok Metropolitan', 13.7563, 100.5018, 'per_visit', '1-2 hours', TRUE, NOW()),
(@provider2_id, 8, 'IoT Sensor Installation', 'Installation of soil moisture, temperature, and humidity sensors with mobile app integration.', 350.00, 'Central Thailand', 13.8591, 100.5258, 'fixed', '4-6 hours', TRUE, NOW()),
(@provider2_id, 7, 'Agricultural Drone Spraying', 'Precision drone spraying for fertilizers and pesticides. Fast and efficient coverage.', 150.00, 'Nonthaburi and nearby provinces', 13.8591, 100.5258, 'per_acre', '1 hour', TRUE, NOW()),
(@provider3_id, 2, 'Mechanical Harvesting Service', 'Professional harvesting using modern machinery. Available for rice, corn, and vegetables.', 120.00, 'Pathum Thani Province', 14.0105, 100.5290, 'per_acre', '3-4 hours', TRUE, NOW()),
(@provider3_id, 3, 'Irrigation System Setup', 'Complete irrigation system installation including pipes, pumps, and timers.', 500.00, 'Pathum Thani and Bangkok', 14.0105, 100.5290, 'fixed', '1-2 days', TRUE, NOW());

-- Get service IDs
SET @service1_id = (SELECT service_id FROM services WHERE title = 'Professional Fertilization Service');
SET @service5_id = (SELECT service_id FROM services WHERE title = 'Mechanical Harvesting Service');
SET @service3_id = (SELECT service_id FROM services WHERE title = 'IoT Sensor Installation');

-- Insert Sample Bookings
INSERT INTO bookings (service_id, customer_id, provider_id, booking_date, scheduled_date, status, total_price, customer_notes, provider_response, payment_status, completed_at, created_at) VALUES
(@service1_id, @customer1_id, @provider1_id, '2025-01-15 10:30:00', '2025-01-20 08:00:00', 'completed', 100.00, 'Need service for 1 acre rice field', 'Will arrive on time with all equipment', 'paid', '2025-01-20 11:30:00', '2025-01-15 10:30:00'),
(@service5_id, @customer2_id, @provider3_id, '2025-01-18 14:20:00', '2025-01-25 07:00:00', 'accepted', 120.00, 'Corn field ready for harvest', 'Confirmed. Weather looks good for that day.', 'pending', NULL, '2025-01-18 14:20:00'),
(@service3_id, @customer1_id, @provider2_id, '2025-01-22 09:15:00', '2025-01-30 09:00:00', 'pending', 350.00, 'Want to install 5 sensors', NULL, 'pending', NULL, '2025-01-22 09:15:00');

-- Get booking ID
SET @booking1_id = (SELECT booking_id FROM bookings WHERE status = 'completed' LIMIT 1);

-- Insert Sample Review
INSERT INTO reviews (booking_id, service_id, customer_id, provider_id, rating, comment, communication_rating, quality_rating, timeliness_rating, provider_response, created_at) VALUES
(@booking1_id, @service1_id, @customer1_id, @provider1_id, 5, 'Excellent service! Very professional and the results were amazing. My crops are growing much better now.', 5, 5, 5, 'Thank you for your kind words! Happy to help anytime.', '2025-01-21 15:00:00');

-- Insert Notifications
INSERT INTO notifications (user_id, type, title, message, related_id, is_read, created_at) VALUES
(@provider1_id, 'new_booking', 'New Booking Request', 'You have a new booking request for your service', @booking1_id, TRUE, '2025-01-15 10:30:00'),
(@customer1_id, 'booking_accepted', 'Booking Accepted', 'Your booking has been accepted by the provider', @booking1_id, TRUE, '2025-01-15 11:00:00'),
(@provider1_id, 'new_review', 'New Review Received', 'You received a 5-star review', 1, TRUE, '2025-01-21 15:00:00');

SELECT 'Sample data imported successfully!' as Status;