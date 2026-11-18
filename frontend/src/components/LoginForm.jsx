import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginForm({ onLoginSuccess }) {
  const { login } = useAuth();
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!membershipId.trim() || !password.trim()) {
      setError('Both Membership ID and Password are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login({
        membership_id: membershipId.trim(),
        password: password.trim()
      });

      login(res.user);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (id, pass) => {
    setMembershipId(id);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="card-header">
        <h2 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          User Login
        </h2>
      </div>

      {error && (
        <div className="alert-banner danger" style={{ marginBottom: '1.25rem' }}>
          <div className="alert-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Membership ID *</label>
          <input
            type="text"
            value={membershipId}
            onChange={(e) => setMembershipId(e.target.value)}
            placeholder="e.g. ADMIN001 or MEM001"
            className="form-input"
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="form-input"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '1.25rem' }}
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Quick Test Credentials (Click to prefill):
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleFillDemo('ADMIN001', 'admin123')}
            className="btn btn-secondary btn-sm"
          >
             Admin: ADMIN001
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('MEM001', 'member123')}
            className="btn btn-secondary btn-sm"
          >
             Member: MEM001
          </button>
        </div>
      </div>
    </div>
  );
}
