import axios from 'axios';

/**
 * Resolves the API base URL cleanly:
 * 1. Checks VITE_API_BASE_URL first.
 * 2. Checks VITE_API_URL as secondary.
 * 3. Falls back to production Render backend in production mode.
 * 4. Falls back to localhost:5000 only in local development mode.
 * 5. Normalizes trailing slashes and ensures /api is present without duplication.
 */
const resolveBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

  if (!url || typeof url !== 'string' || url.trim() === '') {
    url = import.meta.env.PROD
      ? 'https://imovies-76zp.onrender.com/api'
      : 'http://localhost:5000/api';
  }

  // Strip trailing slashes
  url = url.trim().replace(/\/+$/, '');

  // Ensure /api is the endpoint base without duplicating
  return url.endsWith('/api') ? url : `${url}/api`;
};

export const API_BASE_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
      error: error.message || 'Backend server is unreachable',
      data: null,
      statusCode: 0,
    };
  }
};

export default api;
