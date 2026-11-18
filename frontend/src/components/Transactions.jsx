import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Transactions() {
  const [searchParams] = useSearchParams();
  const preselectedBookId = searchParams.get('book');
  const { currentUser, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('BORROW'); // 'BORROW' or 'ADD'
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Form states
  const [borrowForm, setBorrowForm] = useState({
    book_id: preselectedBookId || '',
    user_id: currentUser ? currentUser.id : '',
    quantity: 1
  });

  const [restockForm, setRestockForm] = useState({
    book_id: preselectedBookId || '',
    quantity: 1
  });

  const [historyFilter, setHistoryFilter] = useState('ALL');

  const loadAll = async () => {
    try {
      setLoading(true);
      const [booksData, usersData, transData] = await Promise.all([
        api.getBooks(),
        api.getUsers().catch(() => []),
        api.getTransactions()
      ]);
      setBooks(booksData);
      setUsers(usersData);
      setTransactions(transData);

      if (preselectedBookId) {
        setBorrowForm(prev => ({ ...prev, book_id: preselectedBookId }));
        setRestockForm(prev => ({ ...prev, book_id: preselectedBookId }));
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: 'danger', message: 'Failed to load transaction data: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [preselectedBookId]);

  // Keep user_id in sync with logged-in user
  useEffect(() => {
    if (currentUser) {
      setBorrowForm(prev => ({ ...prev, user_id: currentUser.id }));
    }
  }, [currentUser]);

  // If user is not admin, prevent tab from being 'ADD'
  useEffect(() => {
    if (!isAdmin && activeTab === 'ADD') {
      setActiveTab('BORROW');
    }
  }, [isAdmin, activeTab]);

  // Borrow submission
  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!currentUser) {
      setAlert({
        type: 'warning',
        message: 'Please sign in with your membership account before borrowing books.'
      });
      return;
    }

    if (!borrowForm.book_id) {
      setAlert({ type: 'danger', message: 'Please select a book to borrow.' });
      return;
    }

    const selectedBook = books.find(b => b.id === parseInt(borrowForm.book_id, 10));
    if (!selectedBook) {
      setAlert({ type: 'danger', message: 'Selected book could not be found.' });
      return;
    }

    const qty = parseInt(borrowForm.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setAlert({ type: 'danger', message: 'Borrow quantity must be at least 1.' });
      return;
    }

    if (selectedBook.quantity <= 0) {
      setAlert({
        type: 'danger',
        message: `Cannot borrow "${selectedBook.title}". This book is currently OUT OF STOCK.`
      });
      return;
    }

    if (qty > selectedBook.quantity) {
      setAlert({
        type: 'danger',
        message: `Cannot borrow ${qty} copies of "${selectedBook.title}". Only ${selectedBook.quantity} available in stock.`
      });
      return;
    }

    // Determine target user_id: Member can only borrow for themselves; Admin can select a member
    const targetUserId = isAdmin
      ? (borrowForm.user_id ? parseInt(borrowForm.user_id, 10) : currentUser.id)
      : currentUser.id;

    try {
      setSubmitting(true);
      await api.recordTransaction({
        book_id: parseInt(borrowForm.book_id, 10),
        user_id: targetUserId,
        type: 'BORROW',
        quantity_change: qty
      });

      setAlert({
        type: 'success',
        message: `Successfully borrowed ${qty} copy/copies of "${selectedBook.title}"!`
      });

      // Reset & refresh
      setBorrowForm(prev => ({
        ...prev,
        quantity: 1,
        user_id: currentUser ? currentUser.id : ''
      }));
      await loadAll();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Transaction failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Restock (ADD) submission - Admin only
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!isAdmin) {
      setAlert({ type: 'danger', message: 'Access denied. Only Administrators can restock inventory.' });
      return;
    }

    if (!restockForm.book_id) {
      setAlert({ type: 'danger', message: 'Please select a book to restock.' });
      return;
    }

    const selectedBook = books.find(b => b.id === parseInt(restockForm.book_id, 10));
    const qty = parseInt(restockForm.quantity, 10);

    if (isNaN(qty) || qty <= 0) {
      setAlert({ type: 'danger', message: 'Restock quantity must be at least 1.' });
      return;
    }

    try {
      setSubmitting(true);
      await api.recordTransaction({
        book_id: parseInt(restockForm.book_id, 10),
        user_id: currentUser ? currentUser.id : null,
        type: 'ADD',
        quantity_change: qty
      });

      setAlert({
        type: 'success',
        message: `Successfully added ${qty} copies to "${selectedBook ? selectedBook.title : 'book'}" inventory!`
      });

      setRestockForm(prev => ({ ...prev, quantity: 1 }));
      await loadAll();
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Restock transaction failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHistory = transactions.filter(t => {
    if (historyFilter === 'ALL') return true;
    return t.type === historyFilter;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Stock Transactions &amp; History</h1>
        <p className="page-subtitle">
          Borrow books from available stock, inspect the live history log, and manage library inventory.
        </p>
      </div>

      {alert.message && (
        <div className={`alert-banner ${alert.type}`} style={{ marginBottom: '1.5rem' }}>
          <div className="alert-content">
            {alert.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert({ type: '', message: '' })}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.2rem 0.5rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Transaction Action Form Card */}
      <div className="card">
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'BORROW' ? 'active' : ''}`}
            onClick={() => { setActiveTab('BORROW'); setAlert({ type: '', message: '' }); }}
          >
            <span style={{ marginRight: '0.5rem' }}>📖</span> Borrow Book (Deduct Stock)
          </button>

          {/* Restock Tab - Only visible to Admin */}
          {isAdmin ? (
            <button
              className={`tab-btn ${activeTab === 'ADD' ? 'active' : ''}`}
              onClick={() => { setActiveTab('ADD'); setAlert({ type: '', message: '' }); }}
            >
              <span style={{ marginRight: '0.5rem' }}></span> Restock Inventory (Admin Only)
            </button>
          ) : (
            <div style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
               Restocking restricted to Admins
            </div>
          )}
        </div>

        {activeTab === 'BORROW' ? (
          /* Borrow Form */
          <form onSubmit={handleBorrowSubmit}>
            {!currentUser && (
              <div className="alert-banner warning" style={{ marginBottom: '1.25rem' }}>
                <div className="alert-content">
                  <span>You must be logged in to borrow books.</span>
                </div>
                <Link to="/users" className="btn btn-primary btn-sm">
                  Sign In
                </Link>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Select Book to Borrow *</label>
                <select
                  value={borrowForm.book_id}
                  onChange={(e) => setBorrowForm({ ...borrowForm, book_id: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="">-- Choose a Book --</option>
                  {books.map(b => (
                    <option
                      key={b.id}
                      value={b.id}
                      disabled={b.quantity <= 0}
                    >
                      {b.title} (Stock: {b.quantity} {b.quantity === 0 ? '- OUT OF STOCK' : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Borrowing Member Selector */}
              <div className="form-group">
                <label className="form-label">Borrowing Member *</label>
                {isAdmin ? (
                  /* Admin can choose any registered member */
                  <select
                    value={borrowForm.user_id}
                    onChange={(e) => setBorrowForm({ ...borrowForm, user_id: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">-- Select Registered Member --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.membership_id}) - {u.role}
                      </option>
                    ))}
                  </select>
                ) : (
                  /* Member is locked to their own account */
                  <input
                    type="text"
                    value={currentUser ? `${currentUser.name} (${currentUser.membership_id})` : 'Please sign in'}
                    disabled
                    className="form-input"
                    style={{ backgroundColor: '#f8fafc', color: 'var(--text-secondary)' }}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Quantity to Borrow *</label>
                <input
                  type="number"
                  min="1"
                  value={borrowForm.quantity}
                  onChange={(e) => setBorrowForm({ ...borrowForm, quantity: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || books.length === 0 || !currentUser}
              >
                {submitting ? 'Processing Borrow...' : 'Confirm Borrow (- Stock)'}
              </button>
            </div>
          </form>
        ) : (
          /* Restock Form (Admin Only) */
          <form onSubmit={handleRestockSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Select Book to Restock *</label>
                <select
                  value={restockForm.book_id}
                  onChange={(e) => setRestockForm({ ...restockForm, book_id: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="">-- Choose a Book --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} (Current Stock: {b.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity to Add *</label>
                <input
                  type="number"
                  min="1"
                  value={restockForm.quantity}
                  onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-success"
                disabled={submitting || books.length === 0}
              >
                {submitting ? 'Restocking...' : 'Add to Stock (+ Stock)'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Transaction History Log - Visible to All */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
            Live Transaction History Log
          </h2>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setHistoryFilter('ALL')}
              className={`btn btn-sm ${historyFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setHistoryFilter('BORROW')}
              className={`btn btn-sm ${historyFilter === 'BORROW' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Borrowings
            </button>
            <button
              onClick={() => setHistoryFilter('ADD')}
              className={`btn btn-sm ${historyFilter === 'ADD' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Restocks
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <p>Loading transaction history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <p>No transaction history found for selected filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trans ID</th>
                  <th>Date &amp; Time</th>
                  <th>Action Type</th>
                  <th>Book Title</th>
                  <th>ISBN</th>
                  <th>Member / Actor</th>
                  <th>Quantity Change</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{t.id}</td>
                    <td style={{ fontSize: '0.88rem' }}>
                      {new Date(t.transaction_date).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${t.type === 'ADD' ? 'badge-add' : 'badge-borrow'}`}>
                        {t.type === 'ADD' ? '+ RESTOCK' : '- BORROW'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.book_title || `Book #${t.book_id}`}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{t.book_isbn || '-'}</td>
                    <td>
                      {t.user_name ? (
                        <span>
                          {t.user_name}{' '}
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            ({t.user_membership_id || 'ID'})
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Inventory Restock (Admin)
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: t.type === 'ADD' ? 'var(--success-text)' : 'var(--primary-text)'
                        }}
                      >
                        {t.type === 'ADD' ? `+${t.quantity_change}` : `-${t.quantity_change}`}
                      </span>
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
