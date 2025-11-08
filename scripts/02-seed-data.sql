-- Insert default admin user (password: admin123 - hashed with bcrypt)
INSERT INTO admins (username, password, role) 
VALUES ('admin', '$2a$10$rKvVPZqGsYqjQXZ5yGxYxOxH8K9vZ5qGsYqjQXZ5yGxYxOxH8K9vZ', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample barbers
INSERT INTO barbers (name, specialty, image_url, bio, experience_years) VALUES
('Jakub Kowalski', 'Klasyczne strzyżenia męskie', '/placeholder.svg?height=400&width=400', 'Specjalista od klasycznych męskich fryzur z 8-letnim doświadczeniem.', 8),
('Michał Nowak', 'Nowoczesne stylizacje', '/placeholder.svg?height=400&width=400', 'Ekspert w zakresie nowoczesnych trendów i stylizacji brodowych.', 6),
('Piotr Wiśniewski', 'Brody i golenie', '/placeholder.svg?height=400&width=400', 'Mistrz w sztuce golenia i pielęgnacji brody.', 10)
ON CONFLICT DO NOTHING;

-- Insert sample bookings
INSERT INTO bookings (client_name, client_phone, barber_id, service_type, booking_date, booking_time, status) VALUES
('Jan Kowalski', '+48 123 456 789', 1, 'Strzyżenie męskie', CURRENT_DATE + INTERVAL '1 day', '10:00:00', 'confirmed'),
('Anna Nowak', '+48 987 654 321', 2, 'Stylizacja', CURRENT_DATE + INTERVAL '2 days', '14:00:00', 'pending'),
('Tomasz Wiśniewski', '+48 555 666 777', 3, 'Golenie brody', CURRENT_DATE + INTERVAL '3 days', '16:00:00', 'confirmed')
ON CONFLICT DO NOTHING;
