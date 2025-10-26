-- Railway Reservation System - RDS MySQL Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS railway_db;
USE railway_db;

-- Trains table
CREATE TABLE IF NOT EXISTS trains (
    train_id INT AUTO_INCREMENT PRIMARY KEY,
    train_number VARCHAR(10) UNIQUE NOT NULL,
    train_name VARCHAR(100) NOT NULL,
    train_type ENUM('Express', 'Intercity', 'Superfast', 'Local') DEFAULT 'Express',
    total_coaches INT DEFAULT 12,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_train_number (train_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    departure_station VARCHAR(100) NOT NULL,
    arrival_station VARCHAR(100) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration_hours DECIMAL(4,2) NOT NULL,
    distance_km INT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE,
    INDEX idx_stations (departure_station, arrival_station),
    INDEX idx_train_route (train_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Train schedules and seat availability
CREATE TABLE IF NOT EXISTS train_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    travel_date DATE NOT NULL,
    seat_class ENUM('Sleeper', 'AC-3', 'AC-2', 'AC-1', 'General') DEFAULT 'Sleeper',
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE,
    UNIQUE KEY unique_schedule (train_id, travel_date, seat_class),
    INDEX idx_date_availability (travel_date, available_seats)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    pnr VARCHAR(10) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    train_id INT NOT NULL,
    travel_date DATE NOT NULL,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_age INT NOT NULL,
    passenger_gender ENUM('Male', 'Female', 'Other') NOT NULL,
    seat_preference ENUM('Lower', 'Upper', 'Middle', 'Side Lower', 'Side Upper') DEFAULT 'Lower',
    seat_number VARCHAR(10),
    coach_number VARCHAR(10),
    fare DECIMAL(10,2) NOT NULL,
    payment_transaction_id VARCHAR(100),
    status ENUM('CONFIRMED', 'CANCELLED', 'WAITLIST') DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    FOREIGN KEY (train_id) REFERENCES trains(train_id),
    INDEX idx_pnr (pnr),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_travel_date (travel_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stations master table
CREATE TABLE IF NOT EXISTS stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_code VARCHAR(10) UNIQUE NOT NULL,
    station_name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_station_code (station_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data
INSERT INTO stations (station_code, station_name, city, state) VALUES
('NDLS', 'New Delhi', 'New Delhi', 'Delhi'),
('BCT', 'Mumbai Central', 'Mumbai', 'Maharashtra'),
('HWH', 'Howrah Junction', 'Kolkata', 'West Bengal'),
('MAS', 'Chennai Central', 'Chennai', 'Tamil Nadu'),
('SBC', 'Bangalore City', 'Bangalore', 'Karnataka'),
('PUNE', 'Pune Junction', 'Pune', 'Maharashtra'),
('ADI', 'Ahmedabad Junction', 'Ahmedabad', 'Gujarat'),
('JAI', 'Jaipur Junction', 'Jaipur', 'Rajasthan');

INSERT INTO trains (train_number, train_name, train_type, total_coaches) VALUES
('12001', 'Shatabdi Express', 'Superfast', 16),
('12022', 'Rajdhani Express', 'Superfast', 18),
('12033', 'Duronto Express', 'Superfast', 20),
('12301', 'Howrah Rajdhani', 'Superfast', 18),
('12951', 'Mumbai Rajdhani', 'Superfast', 17);

INSERT INTO routes (train_id, departure_station, arrival_station, departure_time, arrival_time, duration_hours, distance_km) VALUES
(1, 'New Delhi', 'Mumbai Central', '08:00:00', '14:00:00', 6.0, 1400),
(2, 'New Delhi', 'Chennai Central', '10:30:00', '16:30:00', 6.0, 2180),
(3, 'Mumbai Central', 'Bangalore City', '22:00:00', '06:00:00', 8.0, 980),
(4, 'New Delhi', 'Howrah Junction', '17:00:00', '10:00:00', 17.0, 1450),
(5, 'Mumbai Central', 'New Delhi', '16:55:00', '08:35:00', 15.67, 1384);

-- Insert schedules for next 30 days
DELIMITER //
CREATE PROCEDURE populate_schedules()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE schedule_date DATE;
    DECLARE train_cursor INT DEFAULT 1;
    
    WHILE i < 30 DO
        SET schedule_date = DATE_ADD(CURDATE(), INTERVAL i DAY);
        SET train_cursor = 1;
        
        WHILE train_cursor <= 5 DO
            INSERT INTO train_schedules (train_id, travel_date, seat_class, total_seats, available_seats, fare)
            VALUES 
                (train_cursor, schedule_date, 'Sleeper', 72, 72, 750.00),
                (train_cursor, schedule_date, 'AC-3', 64, 64, 1200.00),
                (train_cursor, schedule_date, 'AC-2', 48, 48, 1800.00);
            
            SET train_cursor = train_cursor + 1;
        END WHILE;
        
        SET i = i + 1;
    END WHILE;
END//
DELIMITER ;

CALL populate_schedules();
DROP PROCEDURE populate_schedules;

-- Create indexes for performance
CREATE INDEX idx_booking_user_date ON bookings(user_id, travel_date);
CREATE INDEX idx_schedule_train_date ON train_schedules(train_id, travel_date);
