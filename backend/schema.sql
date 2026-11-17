-- ===================================================
-- Library Management System Database Schema & Seed Data
-- Database: library_db
-- Compatible with MySQL / MariaDB (XAMPP Default)
-- ===================================================

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- 1. Table: books
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  isbn VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table: users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  membership_id VARCHAR(50) NOT NULL UNIQUE,
  role ENUM('Admin', 'Member') NOT NULL DEFAULT 'Member',
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT NULL,
  type ENUM('ADD', 'BORROW') NOT NULL,
  quantity_change INT NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_trans_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT fk_trans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================
-- Initial Seed Data
-- ===================================================

-- Seed Users (Admin & Sample Members)
INSERT INTO users (id, name, membership_id, role, password) VALUES
  (1, 'System Administrator', 'ADMIN001', 'Admin', 'admin123'),
  (2, 'Alice Smith', 'MEM001', 'Member', 'member123'),
  (3, 'Bob Johnson', 'MEM002', 'Member', 'member123')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Books (Includes healthy stock, low stock (<2), and zero stock)
INSERT INTO books (id, title, author, genre, isbn, quantity) VALUES
  (1, 'Clean Code', 'Robert C. Martin', 'Software Engineering', '978-0132350884', 5),
  (2, 'The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 'Computer Science', '978-0201616224', 1),
  (3, 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma et al.', 'Software Architecture', '978-0201633610', 4),
  (4, 'JavaScript: The Good Parts', 'Douglas Crockford', 'Web Development', '978-0596517748', 0),
  (5, 'Introduction to Algorithms', 'Thomas H. Cormen', 'Algorithms', '978-0262033848', 3)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Seed Initial Transactions
INSERT INTO transactions (id, book_id, user_id, type, quantity_change, transaction_date) VALUES
  (1, 1, 1, 'ADD', 5, NOW() - INTERVAL 5 DAY),
  (2, 2, 1, 'ADD', 2, NOW() - INTERVAL 4 DAY),
  (3, 2, 2, 'BORROW', 1, NOW() - INTERVAL 3 DAY),
  (4, 3, 1, 'ADD', 4, NOW() - INTERVAL 2 DAY),
  (5, 5, 1, 'ADD', 3, NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE type=VALUES(type);
