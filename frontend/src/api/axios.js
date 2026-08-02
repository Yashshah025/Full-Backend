import axios from 'axios';

const API = axios.create({
  baseURL: 'https://sip-saviour.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

let inMemoryToken = null;
let refreshSubscribers = [];
let isRefreshing = false;

export const setAccessToken = (token) => {
  inMemoryToken = token;
};

export const getAccessToken = () => {
  return inMemoryToken;
};

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Request Interceptor: Attach Access Token
API.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Automatic Token Refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and has not been retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/login' &&
      originalRequest.url !== '/register'
    ) {
      if (isRefreshing) {
        // Queue concurrent requests while token is refreshing
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(API(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        // Raise global logout event if no refresh token is present
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(error);
      }

      try {
        // Flask API refresh endpoint expects the refresh token in the Authorization header
        const response = await axios.post(
          'http://127.0.0.1:5000/refresh',
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const { access_token, refresh_token } = response.data;

        // Save new rotated tokens
        setAccessToken(access_token);
        localStorage.setItem('refresh_token', refresh_token);

        isRefreshing = false;
        onRefreshed(access_token);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return API(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem('refresh_token');
        setAccessToken(null);
        // Force logout if refresh token is expired or revoked
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
