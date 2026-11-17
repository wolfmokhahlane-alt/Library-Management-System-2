import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import UserForm from './UserForm';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function UserManagement() {
  const { currentUser, logout, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    // Only fetch full user directory if current user is an Admin
    if (!isAdmin) return;

    try {
      setLoading(true);
      setError('');
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleDeleteUser = async (id, name) => {
    if (!isAdmin) {
      alert('Access denied. Admin privileges required.');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete user "${name}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await api.deleteUser(id);
      fetchUsers();
      if (currentUser && currentUser.id === id) {
        logout();
      }
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          {isAdmin ? 'User Management & Directory' : 'User Account & Profile'}
        </h1>
        <p className="page-subtitle">
          {isAdmin
            ? 'Manage library member accounts, assign roles, and administer system access.'
            : 'View your membership details and session authentication.'}
        </p>
      </div>

      {/* Login & Current Session Section */}
      <div style={{ marginBottom: '2rem' }}>
        {currentUser ? (
          <div className="card" style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: isAdmin
                      ? 'linear-gradient(135deg, var(--primary), #818cf8)'
                      : 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{currentUser.name}</h3>
                    <span className={`role-pill ${currentUser.role === 'Admin' ? 'admin' : 'member'}`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Membership ID: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{currentUser.membership_id}</strong>
                  </p>
                </div>
              </div>

              <button onClick={logout} className="btn btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <LoginForm onLoginSuccess={fetchUsers} />
        )}
      </div>

      {/* If logged in as Member: show restricted access message and quick navigation */}
      {currentUser && !isAdmin && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Member Access Information
            </h3>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              You are signed in with a standard <strong>Member</strong> account. In accordance with Role-Based Access Control (RBAC), user directory administration, adding new accounts, and modifying user roles are strictly restricted to <strong>Administrators</strong>.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/transactions" className="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
                Go to Book Transactions
              </Link>
              <Link to="/" className="btn btn-secondary">
                View Library Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Admin View / User Management View - STRICTLY Admin Only */}
      {isAdmin && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Admin View: Registered Users &amp; Members
            </h2>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              {users.length} {users.length === 1 ? 'user' : 'users'} registered
            </span>
          </div>

          {/* User Form for Add / Edit (Admin only) */}
          <UserForm
            editUser={editingUser}
            onUserSaved={() => {
              setEditingUser(null);
              fetchUsers();
            }}
            onCancelEdit={() => setEditingUser(null)}
          />

          {/* Users Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                All Registered Accounts
              </h3>
            </div>

            {error && (
              <div className="alert-banner danger" style={{ marginBottom: '1rem' }}>
                <div className="alert-content">
                  <span>{error}</span>
                </div>
              </div>
            )}

            {loading ? (
              <div className="empty-state">
                <div className="empty-state-icon">⏳</div>
                <p>Loading user list...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <p>No registered users found. Use the form above to add an admin or member.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Full Name</th>
                      <th>Membership ID</th>
                      <th>Role</th>
                      <th>Registration Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{u.id}</td>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{u.membership_id}</td>
                        <td>
                          <span className={`role-pill ${u.role === 'Admin' ? 'admin' : 'member'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }}
                              className="btn btn-secondary btn-sm"
                              title="Edit User"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              disabled={deletingId === u.id}
                              className="btn btn-danger btn-sm"
                              title="Delete User"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              {deletingId === u.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
