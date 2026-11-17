import React, { useState } from 'react';
import { api } from '../api';

export default function AddBookForm({ onBookAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    quantity: 1
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.author.trim()) errs.author = 'Author is required';
    if (!formData.genre.trim()) errs.genre = 'Genre is required';
    if (!formData.isbn.trim()) {
      errs.isbn = 'ISBN is required';
    } else if (formData.isbn.trim().length < 5) {
      errs.isbn = 'ISBN must be at least 5 characters';
    }

    const qty = parseInt(formData.quantity, 10);
    if (isNaN(qty) || qty < 0) {
      errs.quantity = 'Quantity must be 0 or a positive number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setApiError('');

    if (!validate()) return;

    try {
      setLoading(true);
      await api.addBook({
        title: formData.title.trim(),
        author: formData.author.trim(),
        genre: formData.genre.trim(),
        isbn: formData.isbn.trim(),
        quantity: parseInt(formData.quantity, 10) || 0
      });

      setSuccessMsg(`"${formData.title}" added to catalogue successfully!`);
      setFormData({
        title: '',
        author: '',
        genre: '',
        isbn: '',
        quantity: 1
      });
      if (onBookAdded) {
        onBookAdded();
      }
    } catch (err) {
      setApiError(err.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Add New Book
        </h2>
      </div>

      {successMsg && (
        <div className="alert-banner success" style={{ marginBottom: '1.25rem' }}>
          <div className="alert-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {apiError && (
        <div className="alert-banner danger" style={{ marginBottom: '1.25rem' }}>
          <div className="alert-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{apiError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Book Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Clean Code"
              className={`form-input ${errors.title ? 'error' : ''}`}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Author *</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Robert C. Martin"
              className={`form-input ${errors.author ? 'error' : ''}`}
            />
            {errors.author && <span className="form-error">{errors.author}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Genre *</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="e.g. Software Engineering, Fiction, Science"
              className={`form-input ${errors.genre ? 'error' : ''}`}
            />
            {errors.genre && <span className="form-error">{errors.genre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">ISBN *</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="e.g. 978-0132350884"
              className={`form-input ${errors.isbn ? 'error' : ''}`}
            />
            {errors.isbn && <span className="form-error">{errors.isbn}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Initial Quantity *</label>
            <input
              type="number"
              name="quantity"
              min="0"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 5"
              className={`form-input ${errors.quantity ? 'error' : ''}`}
            />
            {errors.quantity && <span className="form-error">{errors.quantity}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding Book...' : 'Save Book'}
          </button>
        </div>
      </form>
    </div>
  );
}
