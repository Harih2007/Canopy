-- CANOPY Zoo Animal Management System
-- Database Schema

CREATE DATABASE IF NOT EXISTS canopy_zoo;
USE canopy_zoo;

-- Animals table
CREATE TABLE IF NOT EXISTS animals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    animal_name VARCHAR(100) NOT NULL,
    species VARCHAR(100) NOT NULL,
    enclosure VARCHAR(100) NOT NULL,
    count INT NOT NULL DEFAULT 1,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

-- Seed animal data
INSERT INTO animals (animal_name, species, enclosure, count) VALUES
('Lion', 'Panthera leo', 'Savanna East (S-4)', 8),
('Tiger', 'Panthera tigris', 'Forest North (A-1)', 5),
('Elephant', 'Elephas maximus', 'Wetlands Zone (W-2)', 12),
('Zebra', 'Equus quagga', 'Savanna West (S-2)', 15),
('Giraffe', 'Giraffa reticulata', 'Savanna East (S-3)', 6),
('Bear', 'Ursus arctos', 'Mountain Range (M-1)', 4),
('Monkey', 'Cercopithecidae', 'Rainforest Canopy (R-1)', 20);

-- Seed admin user (password: admin123)
INSERT INTO admins (username, password) VALUES ('admin', 'admin123');
