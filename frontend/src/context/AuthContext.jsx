import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getSession, logout as apiLogout } from '../api/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSession()
      .then(res => {
        setUser(res.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await apiLogin(email, password);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.data?.message || 'Login failed');
      setUser(null);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      // Ignore logout errors
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}