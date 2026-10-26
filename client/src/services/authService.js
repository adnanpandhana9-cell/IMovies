import api from './api';

export const authService = {
  /**
   * Register a new user account
   */
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.token) {
      localStorage.setItem('imovies_token', res.data.token);
      localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  /**
   * Login with email and password
   */
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('imovies_token', res.data.token);
      localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  /**
   * Retrieve current authenticated user profile
   */
  getMe: async () => {
    const res = await api.get('/auth/me');
    if (res.data.user) {
      localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
    }
    return res.data.user;
  },

  /**
   * Clear local session data
   */
  logout: () => {
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
  },

  /**
   * Get cached token
   */
  getToken: () => {
    return localStorage.getItem('imovies_token');
  },

  /**
   * Get cached user profile
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('imovies_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};

export default authService;
