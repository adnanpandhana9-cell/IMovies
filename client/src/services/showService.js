import api from './api';

export const showService = {
  getShows: async (params = {}) => {
    const res = await api.get('/shows', { params });
    return res.data.shows;
  },

  getShowById: async (id) => {
    const res = await api.get(`/shows/${id}`);
    return res.data;
  },

  createShow: async (showData) => {
    const res = await api.post('/shows', showData);
    return res.data;
  },

  updateShow: async (id, showData) => {
    const res = await api.put(`/shows/${id}`, showData);
    return res.data;
  },

  deleteShow: async (id) => {
    const res = await api.delete(`/shows/${id}`);
    return res.data;
  },
};

export default showService;
