import api from './api';

export const movieService = {
  getMovies: async (params = {}) => {
    const res = await api.get('/movies', { params });
    return res.data;
  },

  getMovieById: async (id) => {
    const res = await api.get(`/movies/${id}`);
    return res.data.movie;
  },

  createMovie: async (movieData) => {
    const res = await api.post('/movies', movieData);
    return res.data;
  },

  updateMovie: async (id, movieData) => {
    const res = await api.put(`/movies/${id}`, movieData);
    return res.data;
  },

  deleteMovie: async (id) => {
    const res = await api.delete(`/movies/${id}`);
    return res.data;
  },
};

export default movieService;
