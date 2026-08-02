import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import API, { setAccessToken } from '../api/axios';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginUserState = async (accessToken, refreshToken) => {
    setAccessToken(accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    try {
      const profile = await authApi.getProfile();
      setUser({ username: profile.user, role: profile.role });
    } catch (e) {
      logout();
    }
  };

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    await loginUserState(data.access_token, data.refresh_token);
  };

  const register = async (username, password, role) => {
    await authApi.register(username, password, role);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout API request failed:', e);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('refresh_token');
    }
  };

  useEffect(() => {
    const checkPersistence = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Verify and fetch initial access token using stored refresh token
          const response = await axios.post(
            `${API.defaults.baseURL}/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );
          const { access_token, refresh_token } = response.data;
          await loginUserState(access_token, refresh_token);
        } catch (e) {
          console.error('Failed to restore persistent session:', e);
          localStorage.removeItem('refresh_token');
          setAccessToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkPersistence();

    // Event listener for unauthorized/force-logout events triggered by Axios interceptor
    const handleGlobalLogout = () => {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('refresh_token');
    };

    window.addEventListener('auth-logout', handleGlobalLogout);

    return () => {
      window.removeEventListener('auth-logout', handleGlobalLogout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
