import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token and user in localStorage
  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // Verify existing token on initial load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('Existing session invalid or expired:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();

    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      handleAuthSuccess(res.token, res.user);
    }
    return res;
  };

  const register = async (name, email, password, currency = 'USD') => {
    const res = await api.register({ name, email, password, currency });
    if (res.success) {
      handleAuthSuccess(res.token, res.user);
    }
    return res;
  };

  const demoLogin = async () => {
    try {
      return await login('demo@expensetracker.com', 'password123');
    } catch {
      // If demo user does not exist in the active database yet, auto-register and login
      return await register('Alex Morgan', 'demo@expensetracker.com', 'password123', 'USD');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateCurrency = async (newCurrency) => {
    if (!user) return;
    try {
      const res = await api.updatePreferences({ currency: newCurrency });
      if (res.success && res.user) {
        const updated = { ...user, currency: newCurrency };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to update currency:', err);
      // Fallback local update
      const updated = { ...user, currency: newCurrency };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const updateBudgetLimit = async (newLimit) => {
    if (!user) return;
    try {
      const res = await api.updatePreferences({ budgetLimit: Number(newLimit) });
      if (res.success && res.user) {
        const updated = { ...user, budgetLimit: Number(newLimit) };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to update budget limit:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateCurrency,
        updateBudgetLimit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
