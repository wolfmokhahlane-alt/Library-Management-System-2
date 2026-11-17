import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [booksData, usersData, transData] = await Promise.all([
        api.getBooks(),
        api.getUsers().catch(() => []),
        api.getTransactions().catch(() => [])
      ]);
      setBooks(booksData);
      setUsers(usersData);
      setTransactions(transData);
    } catch (err) {
      console.error(err);
      setError('Unable to connect to the backend server. Please verify MySQL and the backend are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute key stats
  const totalBooks = books.length;
  const totalQuantity = books.reduce((sum, b) => sum + (parseInt(b.quantity, 10) || 0), 0);
  const lowStockBooks = books.filter(b => b.quantity < 2);
  const outOfStockCount = books.filter(b => b.quantity === 0).length;
  const totalUsers = users.length;

  // Filter books
  const genres = ['ALL', ...new Set(books.map(b => b.genre).filter(Boolean))];

  const filteredBooks = books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'ALL' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Library Overview Dashboard</h1>
        <p className="page-subtitle">Real-time book availability, inventory alerts, and library activity.</p>
      </div>

      {error && (
        <div className="alert-banner danger">
          <div className="alert-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={fetchData} className="btn btn-secondary btn-sm">Retry</button>
        </div>
      )}

      {/* Low Stock Warning Banner if any books have < 2 copies */}
      {lowStockBooks.length > 0 && !loading && (
        <div className="alert-banner warning">
          <div className="alert-content">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div>
              <strong>Low Inventory Alert:</strong> {lowStockBooks.length} book{lowStockBooks.length > 1 ? 's have' : ' has'} fewer than 2 copies available in stock!
            </div>
          </div>
          {isAdmin ? (
            <Link to="/transactions" className="btn btn-primary btn-sm" style={{ backgroundColor: '#d97706' }}>
              Go to Restock
            </Link>
          ) : (
            <Link to="/transactions" className="btn btn-secondary btn-sm">
              Borrow from Stock
            </Link>
          )}
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Total Titles</h3>
            <div className="stat-value">{totalBooks}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Available Copies</h3>
            <div className="stat-value">{totalQuantity}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Low Stock (&lt; 2)</h3>
            <div className="stat-value" style={{ color: lowStockBooks.length > 0 ? 'var(--warning-text)' : 'inherit' }}>
              {lowStockBooks.length}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon secondary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Registered Users</h3>
            <div className="stat-value">{totalUsers}</div>
          </div>
        </div>
      </div>

      {/* Book Availability Table Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Current Book Availability
          </h2>
          {isAdmin ? (
            <Link to="/books" className="btn btn-secondary btn-sm">
              Manage Books
            </Link>
          ) : (
            <Link to="/books" className="btn btn-secondary btn-sm">
              View Catalogue
            </Link>
          )}
        </div>

        <div className="search-filter-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <label className="form-label" style={{ margin: 0 }}>Genre:</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <p>Loading library catalogue...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <p>No books match your search or filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>ISBN</th>
                  <th>Quantity In Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => {
                  const isOutOfStock = book.quantity === 0;
                  const isLowStock = book.quantity > 0 && book.quantity < 2;

                  return (
                    <tr
                      key={book.id}
                      className={isOutOfStock ? 'row-out-of-stock' : isLowStock ? 'row-low-stock' : ''}
                    >
                      <td style={{ fontWeight: 600 }}>{book.title}</td>
                      <td>{book.author}</td>
                      <td>
                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.82rem' }}>
                          {book.genre}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{book.isbn}</td>
                      <td>
                        <strong style={{ fontSize: '1rem' }}>{book.quantity}</strong> copies
                      </td>
                      <td>
                        {isOutOfStock ? (
                          <span className="badge badge-out-of-stock">
                            <span style={{ fontSize: '0.9rem' }}>●</span> Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="badge badge-low-stock">
                            <span style={{ fontSize: '0.9rem' }}>⚠️</span> Low Stock (&lt; 2)
                          </span>
                        ) : (
                          <span className="badge badge-in-stock">
                            <span style={{ fontSize: '0.9rem' }}>✓</span> Available
                          </span>
                        )}
                      </td>
                      <td>
                        <Link
                          to={`/transactions?book=${book.id}`}
                          className="btn btn-secondary btn-sm"
                          title="Borrow or Restock this book"
                        >
                          Transact
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity Log Preview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 14 14"></polyline>
            </svg>
            Recent Transaction Activity
          </h2>
          <Link to="/transactions" className="btn btn-secondary btn-sm">
            View All Transactions
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '1.5rem' }}>
            <p>No transactions logged yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Book Title</th>
                  <th>Member / Actor</th>
                  <th>Quantity Change</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className={`badge ${t.type === 'ADD' ? 'badge-add' : 'badge-borrow'}`}>
                        {t.type === 'ADD' ? '+ RESTOCK' : '- BORROWED'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.book_title || `Book #${t.book_id}`}</td>
                    <td>{t.user_name || 'System / Staff'}</td>
                    <td>
                      <strong>{t.type === 'ADD' ? `+${t.quantity_change}` : `-${t.quantity_change}`}</strong>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(t.transaction_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
