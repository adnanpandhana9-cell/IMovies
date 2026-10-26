import crypto from 'crypto';

/**
 * Simulated Payment Service for Academic Demonstration
 * Generates transparent mock transactions and validates payment amounts.
 */
export const paymentService = {
  /**
   * Simulates processing a transaction with a payment gateway.
   * @param {Object} params
   * @param {string} params.bookingReference
   * @param {number} params.amount
   * @param {string} params.paymentMethod - 'CARD' | 'UPI' | 'NET_BANKING'
   * @param {boolean} params.simulateSuccess - Whether to simulate a successful or failed charge
   */
  processTransaction: async ({ bookingReference, amount, paymentMethod = 'CARD', simulateSuccess = true }) => {
    // Artificial minor latency to mimic real payment processing
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!simulateSuccess) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Simulated payment was declined by the cardholder or issuing bank.',
        transactionId: null,
      };
    }

    const transactionId = 'TXN-' + crypto.randomBytes(5).toString('hex').toUpperCase();

    return {
      success: true,
      status: 'PAID',
      transactionId,
      amount,
      paymentMethod,
      timestamp: new Date().toISOString(),
      provider: 'IMovies Simulated Payment Gateway (Sandbox Mode)',
    };
  },
};

export default paymentService;
