import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mantatrack_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('mantatrack_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [company, setCompany] = useState(() => {
    const raw = localStorage.getItem('mantatrack_company');
    return raw ? JSON.parse(raw) : null;
  });

  const persist = (t, u, c) => {
    localStorage.setItem('mantatrack_token', t);
    localStorage.setItem('mantatrack_user', JSON.stringify(u));
    localStorage.setItem('mantatrack_company', JSON.stringify(c));
    setToken(t);
    setUser(u);
    setCompany(c);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.token, data.user, data.company);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    persist(data.token, data.user, data.company);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mantatrack_token');
    localStorage.removeItem('mantatrack_user');
    localStorage.removeItem('mantatrack_company');
    setToken(null);
    setUser(null);
    setCompany(null);
  }, []);

  const value = useMemo(() => ({
    token, user, company, isAuthenticated: !!token, login, register, logout,
  }), [token, user, company, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
