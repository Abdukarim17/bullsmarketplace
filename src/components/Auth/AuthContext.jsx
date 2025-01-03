import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuth();
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error checking authentication:', error);
      logout();
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/token', 
        new URLSearchParams({ username, password }),
        { 
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);
      await checkAuth();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const register = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/register',
        new URLSearchParams({ username, password }),
        { 
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
      return response.data.message === "User created successfully";
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);