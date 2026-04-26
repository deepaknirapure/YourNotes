// yaha file authentication (login/logout) ka state manage karti hai
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Context banao jo poori app mein use hoga
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // User ki information store karne ke liye state
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // pehle load ho raha hai

  // App open hone par backend ko warm-up karo (free hosting ke liye)
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    fetch(`${apiUrl}/health`).catch(() => {}); // error ignore karo
  }, []);

  // App start hone par localStorage se saved login check karo
  useEffect(() => {
    const savedUser  = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        // Agar data corrupt hai to clear kar do
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setLoading(false); // loading khatam
  }, []);

  // Login karne par user aur token save karo
  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout karne par sab clear karo
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Profile update hone par user info update karo
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook - easily auth data use karne ke liye
export const useAuth = () => useContext(AuthContext);
