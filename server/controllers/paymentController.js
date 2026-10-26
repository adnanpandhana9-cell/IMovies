import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import paymentService from '../services/paymentService.js';

/**
 * @route   POST /api/payments/process
 * @desc    Simulate payment processing for a pending booking
 * @access  Private
 */
export const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod = 'CARD', simulateSuccess = true } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify ownership
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this booking',
      });
    }

    // Prevent duplicate confirmation / idempotency check
    if (booking.bookingStatus === 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid and confirmed.',
        booking,
      });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot process payment: This booking was cancelled.',
      });
    }

    // Run simulated payment transaction
    const paymentResult = await paymentService.processTransaction({
      bookingReference: booking.bookingReference,
      amount: booking.totalAmount,
      paymentMethod,
      simulateSuccess: Boolean(simulateSuccess),
    });

    if (!paymentResult.success) {
      // Payment failure: release seats from temporary hold immediately
      await Show.updateOne(
        { _id: booking.show },
        {
          $pull: { heldSeats: { seatNumber: { $in: booking.seats } } },
        }
      );

      booking.bookingStatus = 'EXPIRED';
      booking.paymentDetails = {
        transactionId: null,
        paymentMethod,
        paidAt: null,
        status: 'FAILED',
      };
      await booking.save();

      return res.status(400).json({
        success: false,
        message: 'Payment simulation failed. Your seats have been released.',
        error: paymentResult.error,
        booking,
      });
    }

    // Payment success: Confirm booking & permanently book seats in Show
    booking.bookingStatus = 'CONFIRMED';
    booking.paymentDetails = {
      transactionId: paymentResult.transactionId,
      paymentMethod,
      paidAt: new Date(),
      status: 'PAID',
    };
    await booking.save();

    // Atomically transfer seats from held to booked
    const updatedShow = await Show.findOneAndUpdate(
      { _id: booking.show },
      {
        $pull: { heldSeats: { seatNumber: { $in: booking.seats } } },
        $addToSet: { bookedSeats: { $each: booking.seats } },
        $inc: { availableSeatsCount: -booking.seats.length },
      },
      { new: true }
    );

    // If available seats reached 0, mark show as SOLD_OUT
    if (updatedShow && updatedShow.availableSeatsCount <= 0) {
      await Show.updateOne({ _id: booking.show }, { $set: { status: 'SOLD_OUT' } });
    }

    res.status(200).json({
      success: true,
      message: 'Simulated payment succeeded! Booking is confirmed.',
      payment: paymentResult,
      booking,
    });
  } catch (error) {
    next(error);
  }
};
