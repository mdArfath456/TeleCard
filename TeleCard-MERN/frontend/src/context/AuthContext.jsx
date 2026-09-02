import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/api/user/profile');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    setUser({ id: data.userId, name: data.name, email: data.email, role: data.role });
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/api/auth/register', payload);
    setUser({ id: data.userId, name: data.name, email: data.email, role: data.role });
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refresh: loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
