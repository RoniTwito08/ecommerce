import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem('helfy_access_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authApi.getMe();
      setUser(data.data.user);
    } catch {
      localStorage.removeItem('helfy_access_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
    const onLogout = () => { setUser(null); };
    window.addEventListener('helfy:logout', onLogout);
    return () => window.removeEventListener('helfy:logout', onLogout);
  }, [restoreSession]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('helfy_access_token', data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (userData) => {
    const { data } = await authApi.register(userData);
    localStorage.setItem('helfy_access_token', data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('helfy_access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
