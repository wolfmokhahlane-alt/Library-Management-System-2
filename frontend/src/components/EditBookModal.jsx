import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function EditBookModal({ book, isOpen, onClose, onBookUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    quantity: 0
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        genre: book.genre || '',
        isbn: book.isbn || '',
        quantity: book.quantity !== undefined ? book.quantity : 0
      });
      setErrors({});
      setApiError('');
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.author.trim()) errs.author = 'Author is required';
    if (!formData.genre.trim()) errs.genre = 'Genre is required';
    if (!formData.isbn.trim()) errs.isbn = 'ISBN is required';

    const qty = parseInt(formData.quantity, 10);
    if (isNaN(qty) || qty < 0) {
      errs.quantity = 'Quantity cannot be negative';
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setApiError('');
      await api.updateBook(book.id, {
        title: formData.title.trim(),
        author: formData.author.trim(),
        genre: formData.genre.trim(),
        isbn: formData.isbn.trim(),
        quantity: parseInt(formData.quantity, 10) || 0
      });

      if (onBookUpdated) {
        onBookUpdated();
      }
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to update book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Update Book Details</h3>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {apiError && (
              <div className="alert-banner danger" style={{ marginBottom: '1rem' }}>
                <div className="alert-content">
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Book Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'error' : ''}`}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Author *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className={`form-input ${errors.author ? 'error' : ''}`}
              />
              {errors.author && <span className="form-error">{errors.author}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Genre *</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className={`form-input ${errors.genre ? 'error' : ''}`}
              />
              {errors.genre && <span className="form-error">{errors.genre}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">ISBN *</label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className={`form-input ${errors.isbn ? 'error' : ''}`}
              />
              {errors.isbn && <span className="form-error">{errors.isbn}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Quantity in Stock *</label>
              <input
                type="number"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                className={`form-input ${errors.quantity ? 'error' : ''}`}
              />
              {errors.quantity && <span className="form-error">{errors.quantity}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving Changes...' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
