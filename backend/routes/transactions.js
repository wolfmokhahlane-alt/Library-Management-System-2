const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /transactions - Fetch all transactions with book title and user name
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id,
        t.book_id,
        b.title AS book_title,
        b.isbn AS book_isbn,
        t.user_id,
        u.name AS user_name,
        u.membership_id AS user_membership_id,
        t.type,
        t.quantity_change,
        t.transaction_date
      FROM transactions t
      LEFT JOIN books b ON t.book_id = b.id
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.transaction_date DESC, t.id DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions: ' + error.message });
  }
});

// POST /transactions - Record a new stock transaction (ADD or BORROW)
router.post('/', async (req, res) => {
  let connection;
  try {
    const { book_id, user_id, type, quantity_change } = req.body;

    if (!book_id) {
      return res.status(400).json({ error: 'Book selection is required' });
    }

    if (!type || !['ADD', 'BORROW'].includes(type.toUpperCase())) {
      return res.status(400).json({ error: 'Transaction type must be ADD or BORROW' });
    }

    const transType = type.toUpperCase();
    const qtyChange = parseInt(quantity_change, 10);
    if (isNaN(qtyChange) || qtyChange <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer greater than 0' });
    }

    // Restock (ADD) requires Admin privileges
    if (transType === 'ADD' && req.headers['x-user-role'] !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Only Administrators can restock inventory.' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if book exists and lock row for update
    const [books] = await connection.query(
      'SELECT id, title, quantity FROM books WHERE id = ? FOR UPDATE',
      [book_id]
    );

    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Selected book was not found' });
    }

    const currentBook = books[0];

    // If borrowing, validate stock and user
    if (transType === 'BORROW') {
      if (currentBook.quantity <= 0) {
        await connection.rollback();
        return res.status(400).json({
          error: `Cannot borrow "${currentBook.title}". It is currently out of stock (0 available).`
        });
      }

      if (currentBook.quantity < qtyChange) {
        await connection.rollback();
        return res.status(400).json({
          error: `Insufficient stock for "${currentBook.title}". Requested: ${qtyChange}, Available: ${currentBook.quantity}.`
        });
      }

      // If user_id is passed, verify user exists
      if (user_id) {
        const [users] = await connection.query('SELECT id FROM users WHERE id = ?', [user_id]);
        if (users.length === 0) {
          await connection.rollback();
          return res.status(404).json({ error: 'Selected member was not found' });
        }
      }

      // Deduct stock
      await connection.query(
        'UPDATE books SET quantity = quantity - ? WHERE id = ?',
        [qtyChange, book_id]
      );
    } else {
      // transType === 'ADD' (Restock)
      await connection.query(
        'UPDATE books SET quantity = quantity + ? WHERE id = ?',
        [qtyChange, book_id]
      );
    }

    // Insert transaction
    const finalUserId = user_id ? parseInt(user_id, 10) : null;
    const [transResult] = await connection.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity_change) VALUES (?, ?, ?, ?)',
      [book_id, finalUserId, transType, qtyChange]
    );

    await connection.commit();

    // Fetch updated book quantity
    const [updatedBook] = await pool.query('SELECT quantity FROM books WHERE id = ?', [book_id]);

    res.status(201).json({
      message: `Transaction recorded successfully (${transType})`,
      transaction_id: transResult.insertId,
      book_id,
      user_id: finalUserId,
      type: transType,
      quantity_change: qtyChange,
      updated_book_quantity: updatedBook[0].quantity
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rbErr) {
        console.error('Error rolling back transaction:', rbErr);
      }
    }
    console.error('Error recording transaction:', error);
    res.status(500).json({ error: 'Failed to record transaction: ' + error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;
