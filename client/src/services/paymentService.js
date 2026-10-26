import api from './api';

export const paymentService = {
  processPayment: async ({ bookingId, paymentMethod = 'CARD', simulateSuccess = true }) => {
    const res = await api.post('/payments/process', {
      bookingId,
      paymentMethod,
      simulateSuccess,
    });
    return res.data;
  },
};

export default paymentService;
