import React, { useState } from 'react';
import EditBookModal from './EditBookModal';
import { api } from '../api';

export default function BookList({ books, loading, onBookMutated, isAdmin = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBook, setEditingBook] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id, title) => {
    if (!isAdmin) {
      alert('Admin privileges required to delete books.');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setDeleteError('');
      await api.deleteBook(id);
      if (onBookMutated) {
        onBookMutated();
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete book');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Catalogue & Book Management
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {filtered.length} {filtered.length === 1 ? 'book' : 'books'} found
        </span>
      </div>

      {deleteError && (
        <div className="alert-banner danger" style={{ marginBottom: '1.25rem' }}>
          <div className="alert-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{deleteError}</span>
          </div>
        </div>
      )}

      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by title, author, genre, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <p>Loading book records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <p>No books found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>ISBN</th>
                <th>Stock</th>
                <th>Status</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(book => {
                const isOutOfStock = book.quantity === 0;
                const isLowStock = book.quantity > 0 && book.quantity < 2;

                return (
                  <tr
                    key={book.id}
                    className={isOutOfStock ? 'row-out-of-stock' : isLowStock ? 'row-low-stock' : ''}
                  >
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{book.id}</td>
                    <td style={{ fontWeight: 600 }}>{book.title}</td>
                    <td>{book.author}</td>
                    <td>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.82rem' }}>
                        {book.genre}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{book.isbn}</td>
                    <td>
                      <strong>{book.quantity}</strong>
                    </td>
                    <td>
                      {isOutOfStock ? (
                        <span className="badge badge-out-of-stock">Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="badge badge-low-stock">Low Stock (&lt; 2)</span>
                      ) : (
                        <span className="badge badge-in-stock">Available</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditingBook(book)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Book Details"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(book.id, book.title)}
                            disabled={deletingId === book.id}
                            className="btn btn-danger btn-sm"
                            title="Delete Book"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            {deletingId === book.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal (Admin only) */}
      {isAdmin && editingBook && (
        <EditBookModal
          book={editingBook}
          isOpen={Boolean(editingBook)}
          onClose={() => setEditingBook(null)}
          onBookUpdated={() => {
            setEditingBook(null);
            if (onBookMutated) onBookMutated();
          }}
        />
      )}
    </div>
  );
}
