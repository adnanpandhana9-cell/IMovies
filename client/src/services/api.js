import axios from 'axios';

// Central Axios API instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Consistent error handling & session expiry detection
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // If server returns 401 and token is expired/invalid, clear local token
      if (error.response.status === 401) {
        const message = error.response.data?.message || '';
        if (message.includes('expired') || message.includes('token') || message.includes('denied')) {
          localStorage.removeItem('imovies_token');
          localStorage.removeItem('imovies_user');
        }
      }
      console.warn(`[API Error ${error.response.status}]`, error.response.data?.message || error.message);
    } else if (error.request) {
      console.warn('[API Network Error] Backend server unreachable at', API_BASE_URL);
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Health check endpoint service
 */
export const checkHealth = async () => {
  try {
    const res = await api.get('/health');
    return {
      online: true,
      data: res.data,
      statusCode: res.status,
    };
  } catch (error) {
    if (error.response && error.response.data) {
      return {
        online: true,
        data: error.response.data,
        statusCode: error.response.status,
      };
    }
    return {
      online: false,
      error: error.message,
      data: null,
      statusCode: 0,
    };
  }
};

export default api;
