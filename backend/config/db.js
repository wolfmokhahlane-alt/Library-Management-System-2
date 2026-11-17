const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to auto-initialize DB and tables if MySQL is running
async function initDatabase() {
  try {
    // 1. Check if database exists, create if not
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConnection.end();

    // 2. Test pool connection to the database
    const conn = await pool.getConnection();

    // Ensure tables exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        isbn VARCHAR(50) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        membership_id VARCHAR(50) NOT NULL UNIQUE,
        role ENUM('Admin', 'Member') NOT NULL DEFAULT 'Member',
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
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
    `);

    // Check if initial users exist, if not seed default admin and members
    const [userRows] = await conn.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('Seeding initial default users...');
      await conn.query(`
        INSERT INTO users (name, membership_id, role, password) VALUES
        ('System Administrator', 'ADMIN001', 'Admin', 'admin123'),
        ('Alice Smith', 'MEM001', 'Member', 'member123'),
        ('Bob Johnson', 'MEM002', 'Member', 'member123')
      `);
    }

    // Check if initial books exist, if not seed sample books
    const [bookRows] = await conn.query('SELECT COUNT(*) as count FROM books');
    if (bookRows[0].count === 0) {
      console.log('Seeding initial sample books...');
      await conn.query(`
        INSERT INTO books (title, author, genre, isbn, quantity) VALUES
        ('Clean Code', 'Robert C. Martin', 'Software Engineering', '978-0132350884', 5),
        ('The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 'Computer Science', '978-0201616224', 1),
        ('Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma et al.', 'Software Architecture', '978-0201633610', 4),
        ('JavaScript: The Good Parts', 'Douglas Crockford', 'Web Development', '978-0596517748', 0),
        ('Introduction to Algorithms', 'Thomas H. Cormen', 'Algorithms', '978-0262033848', 3)
      `);
    }

    // Check if initial transactions exist, if not seed
    const [transRows] = await conn.query('SELECT COUNT(*) as count FROM transactions');
    if (transRows[0].count === 0) {
      console.log('Seeding initial sample transactions...');
      await conn.query(`
        INSERT INTO transactions (book_id, user_id, type, quantity_change, transaction_date) VALUES
        (1, 1, 'ADD', 5, NOW() - INTERVAL 5 DAY),
        (2, 1, 'ADD', 2, NOW() - INTERVAL 4 DAY),
        (2, 2, 'BORROW', 1, NOW() - INTERVAL 3 DAY),
        (3, 1, 'ADD', 4, NOW() - INTERVAL 2 DAY),
        (5, 1, 'ADD', 3, NOW() - INTERVAL 1 DAY)
      `);
    }

    conn.release();
    console.log(`[Database] Connected successfully to MySQL database "${dbConfig.database}".`);
  } catch (error) {
    console.warn(`[Database Warning] Could not automatically initialize MySQL: ${error.message}`);
    console.warn('[Database Warning] Please ensure MySQL/XAMPP is running and "schema.sql" has been imported.');
  }
}

module.exports = {
  pool,
  initDatabase
};
