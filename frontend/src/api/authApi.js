import API from './axios';
import axios from 'axios';

export const authApi = {
  register: async (username, password, role = 'customer') => {
    const response = await API.post('/register', { username, password, role });
    return response.data;
  },

  login: async (username, password) => {
    const response = await API.post('/login', { username, password });
    return response.data; // Returns { access_token, refresh_token }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      // Use direct axios call since /logout requires refresh token auth, not access token auth
      await axios.post(
        'http://127.0.0.1:5000/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );
    }
  },

  getProfile: async () => {
    const response = await API.get('/profile');
    return response.data; // Returns { user: username, role: role }
  },
};
