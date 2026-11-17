import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import BookManagementPage from './pages/BookManagementPage';
import TransactionsPage from './pages/TransactionsPage';
import UserManagementPage from './pages/UserManagementPage';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/books" element={<BookManagementPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer style={{
            textAlign: 'center',
            padding: '1.5rem',
            borderTop: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            Library Management System &bull;
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
