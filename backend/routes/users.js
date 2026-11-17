const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// GET /users - Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, membership_id, role, created_at FROM users ORDER BY id ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /users/:id - Get a single user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, name, membership_id, role, created_at FROM users WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /users/login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { membership_id, password } = req.body;

    if (!membership_id || !password) {
      return res.status(400).json({ error: 'Membership ID and Password are required' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, membership_id, role, password FROM users WHERE membership_id = ?',
      [membership_id.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid Membership ID or Password' });
    }

    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid Membership ID or Password' });
    }

    // Return authenticated user details without password
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        membership_id: user.membership_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login service failed: ' + error.message });
  }
});

// POST /users - Add a new user (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, membership_id, role, password } = req.body;

    if (!name || !membership_id || !password) {
      return res.status(400).json({ error: 'Name, Membership ID, and Password are required' });
    }

    const validRole = role && ['Admin', 'Member'].includes(role) ? role : 'Member';

    // Check duplicate membership_id
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE membership_id = ?',
      [membership_id.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Membership ID already exists' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, membership_id, role, password) VALUES (?, ?, ?, ?)',
      [name.trim(), membership_id.trim(), validRole, password.trim()]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      membership_id: membership_id.trim(),
      role: validRole
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user: ' + error.message });
  }
});

// PUT /users/:id - Update user details (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, membership_id, role, password } = req.body;

    if (!name || !membership_id) {
      return res.status(400).json({ error: 'Name and Membership ID are required' });
    }

    const validRole = role && ['Admin', 'Member'].includes(role) ? role : 'Member';

    // Verify user exists
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if membership_id is taken by another user
    const [conflict] = await pool.query(
      'SELECT id FROM users WHERE membership_id = ? AND id != ?',
      [membership_id.trim(), id]
    );
    if (conflict.length > 0) {
      return res.status(409).json({ error: 'Membership ID is already in use by another user' });
    }

    if (password && password.trim() !== '') {
      await pool.query(
        'UPDATE users SET name = ?, membership_id = ?, role = ?, password = ? WHERE id = ?',
        [name.trim(), membership_id.trim(), validRole, password.trim(), id]
      );
    } else {
      await pool.query(
        'UPDATE users SET name = ?, membership_id = ?, role = ? WHERE id = ?',
        [name.trim(), membership_id.trim(), validRole, id]
      );
    }

    res.json({
      id: parseInt(id, 10),
      name: name.trim(),
      membership_id: membership_id.trim(),
      role: validRole
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user: ' + error.message });
  }
});

// DELETE /users/:id - Delete a user (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully', id: parseInt(id, 10) });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user: ' + error.message });
  }
});

module.exports = router;
