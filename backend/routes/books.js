const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// GET /books - Get all books (accessible to all)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET /books/:id - Get a specific book
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// POST /books - Add a new book (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;

    if (!title || !author || !genre || !isbn) {
      return res.status(400).json({ error: 'Title, Author, Genre, and ISBN are required' });
    }

    const initialQuantity = parseInt(quantity, 10);
    const validQuantity = isNaN(initialQuantity) || initialQuantity < 0 ? 0 : initialQuantity;

    const [result] = await pool.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), validQuantity]
    );

    const newBook = {
      id: result.insertId,
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      isbn: isbn.trim(),
      quantity: validQuantity
    };

    // Also record an initial 'ADD' transaction if quantity > 0
    if (validQuantity > 0) {
      try {
        await pool.query(
          'INSERT INTO transactions (book_id, user_id, type, quantity_change) VALUES (?, ?, ?, ?)',
          [result.insertId, null, 'ADD', validQuantity]
        );
      } catch (tErr) {
        console.warn('Initial stock transaction notice:', tErr.message);
      }
    }

    res.status(201).json(newBook);
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book: ' + error.message });
  }
});

// PUT /books/:id - Update book details (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, genre, isbn, quantity } = req.body;

    if (!title || !author || !genre || !isbn) {
      return res.status(400).json({ error: 'Title, Author, Genre, and ISBN are required' });
    }

    const bookQty = parseInt(quantity, 10);
    const validQuantity = isNaN(bookQty) || bookQty < 0 ? 0 : bookQty;

    const [check] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    await pool.query(
      'UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE id = ?',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), validQuantity, id]
    );

    res.json({
      id: parseInt(id, 10),
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      isbn: isbn.trim(),
      quantity: validQuantity
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book: ' + error.message });
  }
});

// DELETE /books/:id - Delete a book (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [check] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    await pool.query('DELETE FROM books WHERE id = ?', [id]);
    res.json({ message: 'Book deleted successfully', id: parseInt(id, 10) });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;
