import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function UserForm({ editUser, onUserSaved, onCancelEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    membership_id: '',
    role: 'Member',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isEditMode = Boolean(editUser);

  useEffect(() => {
    if (editUser) {
      setFormData({
        name: editUser.name || '',
        membership_id: editUser.membership_id || '',
        role: editUser.role || 'Member',
        password: '' // Keep empty unless updating password
      });
      setErrors({});
      setApiError('');
      setSuccessMsg('');
    } else {
      setFormData({
        name: '',
        membership_id: '',
        role: 'Member',
        password: ''
      });
    }
  }, [editUser]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.membership_id.trim()) errs.membership_id = 'Membership ID is required';
    if (!isEditMode && !formData.password.trim()) {
      errs.password = 'Password is required for new users';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    if (!validate()) return;

    try {
      setLoading(true);
      if (isEditMode) {
        await api.updateUser(editUser.id, {
          name: formData.name.trim(),
          membership_id: formData.membership_id.trim(),
          role: formData.role,
          password: formData.password.trim() || undefined
        });
        setSuccessMsg(`User "${formData.name}" updated successfully!`);
      } else {
        await api.addUser({
          name: formData.name.trim(),
          membership_id: formData.membership_id.trim(),
          role: formData.role,
          password: formData.password.trim()
        });
        setSuccessMsg(`User "${formData.name}" registered successfully!`);
        setFormData({
          name: '',
          membership_id: '',
          role: 'Member',
          password: ''
        });
      }

      if (onUserSaved) {
        onUserSaved();
      }
    } catch (err) {
      setApiError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          {isEditMode ? `Edit User: ${editUser.name}` : 'Register New User'}
        </h2>
        {isEditMode && (
          <button onClick={onCancelEdit} className="btn btn-secondary btn-sm">
            Cancel Edit
          </button>
        )}
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
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className={`form-input ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Membership ID *</label>
            <input
              type="text"
              name="membership_id"
              value={formData.membership_id}
              onChange={handleChange}
              placeholder="e.g. MEM003 or ADMIN002"
              className={`form-input ${errors.membership_id ? 'error' : ''}`}
            />
            {errors.membership_id && <span className="form-error">{errors.membership_id}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              {isEditMode ? 'New Password (leave blank to keep current)' : 'Password *'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEditMode ? '••••••••' : 'Enter account password'}
              className={`form-input ${errors.password ? 'error' : ''}`}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
        </div>

        <div className="form-actions">
          {isEditMode && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? 'Saving...'
              : isEditMode
              ? 'Update User'
              : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
}
