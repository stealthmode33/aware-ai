"import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('iv_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => setUser(res.data))
        .catch(() => { setToken(null); localStorage.removeItem('iv_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('iv_token', t);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API}/api/auth/register`, { name, email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('iv_token', t);
    return u;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('iv_token');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (e) {}
  };

  const authAxios = axios.create({ baseURL: API });
  authAxios.interceptors.request.use(cfg => {
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
"
