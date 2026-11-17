// Centralized API client for Library Management System
// Uses native Fetch API as required by the assignment

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getAuthHeaders() {
  try {
    const user = JSON.parse(localStorage.getItem('library_user'));
    return {
      'x-user-role': user?.role || ''
    };
  } catch {
    return {
      'x-user-role': ''
    };
  }
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }
  return data;
}

export const api = {
  // Books CRUD
  getBooks: async () => {
    const res = await fetch(`${API_BASE_URL}/books`);
    return handleResponse(res);
  },

  getBookById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/books/${id}`);
    return handleResponse(res);
  },

  addBook: async (bookData) => {
    const res = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(bookData)
    });
    return handleResponse(res);
  },

  updateBook: async (id, bookData) => {
    const res = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(bookData)
    });
    return handleResponse(res);
  },

  deleteBook: async (id) => {
    const res = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    return handleResponse(res);
  },

  // Users CRUD & Auth
  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users`);
    return handleResponse(res);
  },

  getUserById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`);
    return handleResponse(res);
  },

  addUser: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  updateUser: async (id, userData) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    return handleResponse(res);
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  // Transactions
  getTransactions: async () => {
    const res = await fetch(`${API_BASE_URL}/transactions`);
    return handleResponse(res);
  },

  recordTransaction: async (transactionData) => {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(transactionData)
    });
    return handleResponse(res);
  }
};
