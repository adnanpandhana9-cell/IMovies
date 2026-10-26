import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard metrics from real database collections
 * @access  Private (Admin only)
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalMovies,
      totalTheatres,
      totalShows,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalUsers,
    ] = await Promise.all([
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments({ status: { $ne: 'CANCELLED' } }),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'CONFIRMED' }),
      Booking.countDocuments({ bookingStatus: 'CANCELLED' }),
      User.countDocuments({ role: 'USER' }),
    ]);

    // Aggregate total revenue from confirmed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { bookingStatus: 'CONFIRMED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalMovies,
        totalTheatres,
        totalShows,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalUsers,
        totalRevenue,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};
