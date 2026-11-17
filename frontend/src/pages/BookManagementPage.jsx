import React, { useState, useEffect } from 'react';
import AddBookForm from '../components/AddBookForm';
import BookList from '../components/BookList';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function BookManagementPage() {
  const { isAdmin, currentUser } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await api.getBooks();
      setBooks(data);
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Book Management</h1>
        <p className="page-subtitle">
          {isAdmin
            ? 'Add new titles to the library catalogue, update details, and manage inventory.'
            : 'Library catalogue browser (Read-only view).'}
        </p>
      </div>

      {/* RBAC Notice if user is not an Admin */}
      {!isAdmin && (
        <div className="alert-banner warning" style={{ marginBottom: '1.5rem' }}>
          <div className="alert-content">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <div>
              <strong>Admin Access Required:</strong> You are currently signed in as{' '}
              <strong>{currentUser ? `${currentUser.name} (${currentUser.role})` : 'a Guest'}</strong>. Only users with the <strong>Admin</strong> role can add, edit, or delete books.
            </div>
          </div>
        </div>
      )}

      {/* Controlled Add Book Form - Admin Only */}
      {isAdmin && <AddBookForm onBookAdded={fetchBooks} />}

      {/* Book List with Update & Delete buttons visible only for Admins */}
      <BookList
        books={books}
        loading={loading}
        onBookMutated={fetchBooks}
        isAdmin={isAdmin}
      />
    </div>
  );
}
