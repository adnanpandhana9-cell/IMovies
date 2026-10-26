import api from './api';

export const bookingService = {
  createBooking: async (showId, selectedSeats) => {
    const res = await api.post('/bookings', { showId, selectedSeats });
    return res.data;
  },

  getMyBookings: async () => {
    const res = await api.get('/bookings/my-bookings');
    return res.data.bookings;
  },

  getBookingById: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data.booking;
  },

  cancelBooking: async (id, reason) => {
    const res = await api.post(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },

  getAdminBookings: async (params = {}) => {
    const res = await api.get('/bookings/admin/all', { params });
    return res.data;
  },
};

export default bookingService;
