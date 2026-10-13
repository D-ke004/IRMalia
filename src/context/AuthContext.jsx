import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore session from server
  useEffect(() => {
    axios.get('/api/auth/me.php', { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const r = await axios.post('/api/auth/login.php', { username, password }, { withCredentials: true });
    setUser(r.data);
    return r.data;
  }, []);

  const logout = useCallback(async () => {
    await axios.post('/api/auth/logout.php', {}, { withCredentials: true }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
