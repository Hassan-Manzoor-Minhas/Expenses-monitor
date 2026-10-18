const API_BASE = '/api';
const BACKEND_URL = 'http://localhost:5000/api';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (err) {
    // If local proxy failed (e.g. port mismatch or proxy stopped), attempt direct call to backend
    try {
      response = await fetch(`${BACKEND_URL}${endpoint}`, config);
    } catch {
      throw new Error(
        'Unable to connect to the backend server. Please verify the server is running on http://localhost:5000'
      );
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-expired'));
    }
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// API Methods
export const api = {
  // Health
  getHealth: () => apiClient('/health'),
  reconnectDB: () => apiClient('/health/reconnect', { method: 'POST' }),

  // Auth
  login: (credentials) =>
    apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => apiClient('/auth/me'),
  updatePreferences: (preferences) =>
    apiClient('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }),

  // Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/transactions${queryString}`);
  },
  getTransactionSummary: () => apiClient('/transactions/summary'),
  createTransaction: (data) =>
    apiClient('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTransaction: (id, data) =>
    apiClient(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTransaction: (id) =>
    apiClient(`/transactions/${id}`, {
      method: 'DELETE',
    }),
  importTransactions: (transactions) =>
    apiClient('/transactions/import', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    }),
  seedTransactions: () =>
    apiClient('/transactions/seed', {
      method: 'POST',
    }),
};
