const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./config/db');
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');
const transactionsRouter = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-role', 'Authorization']
}));
app.use(express.json());

// Routes (supporting both direct path and /api prefix)
app.use('/books', booksRouter);
app.use('/api/books', booksRouter);

app.use('/users', usersRouter);
app.use('/api/users', usersRouter);

app.use('/transactions', transactionsRouter);
app.use('/api/transactions', transactionsRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Library Management System API is running',
    endpoints: {
      books: '/books',
      users: '/users',
      transactions: '/transactions'
    }
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error: ' + err.message });
});

// Start server and initialize database
app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(` Library Management System - Backend Server    `);
  console.log(` Server running on http://localhost:${PORT}    `);
  console.log(`===============================================`);
  await initDatabase();
});
