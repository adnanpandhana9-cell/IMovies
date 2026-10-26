import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';

/**
 * @route   POST /api/bookings
 * @desc    Create a new seat hold and pending booking with atomic concurrency protection
 * @access  Private (Authenticated User)
 */
export const createBooking = async (req, res, next) => {
  try {
    const { showId, selectedSeats } = req.body;

    if (!showId) {
      return res.status(400).json({
        success: false,
        message: 'Show ID is required',
      });
    }

    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one seat',
      });
    }

    // Clean & normalize seat identifiers (e.g. "A1", "B4")
    const normalizedSeats = [...new Set(selectedSeats.map((s) => String(s).trim().toUpperCase()))];

    const show = await Show.findById(showId)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    if (show.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This show has been cancelled and cannot accept bookings',
      });
    }

    const now = new Date();
    const holdExpiry = new Date(now.getTime() + 10 * 60 * 1000); // 10 minute seat hold

    // 1. Release expired seat holds before attempting reservation
    await Show.updateOne(
      { _id: showId },
      { $pull: { heldSeats: { expiresAt: { $lte: now } } } }
    );

    // 2. Atomic Conditional Update:
    // Only lock seats if NONE of the selected seats are already booked,
    // and NONE of them are currently held by an unexpired reservation.
    const holdItems = normalizedSeats.map((seatNumber) => ({
      seatNumber,
      heldBy: req.user._id,
      expiresAt: holdExpiry,
    }));

    const lockedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        bookedSeats: { $nin: normalizedSeats },
        'heldSeats.seatNumber': { $nin: normalizedSeats },
      },
      {
        $push: { heldSeats: { $each: holdItems } },
      },
      { new: true }
    );

    // If update returned null, a concurrent booking attempt took one or more seats
    if (!lockedShow) {
      return res.status(409).json({
        success: false,
        message: 'One or more selected seats are unavailable or were just reserved by another customer. Please choose different seats.',
      });
    }

    // 3. Server-side price calculation (Never trust client-supplied total)
    const ticketPrice = show.ticketPrice;
    const totalAmount = ticketPrice * normalizedSeats.length;

    // 4. Unique Booking Reference Generation
    const bookingReference = 'IMV-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    // 5. Store snapshot of movie and theatre data
    const booking = new Booking({
      bookingReference,
      user: req.user._id,
      show: show._id,
      movieSnapshot: {
        title: show.movie.title,
        posterUrl: show.movie.posterUrl,
        duration: show.movie.duration,
        language: show.movie.language,
        genre: show.movie.genre,
      },
      theatreSnapshot: {
        name: show.theatre.name,
        city: show.theatre.city,
        address: show.theatre.address,
        screenName: show.screenName,
      },
      showDetails: {
        showDate: show.showDate,
        startTime: show.startTime,
      },
      seats: normalizedSeats,
      ticketPrice,
      totalAmount,
      bookingStatus: 'PENDING_PAYMENT',
      expiresAt: holdExpiry,
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Seats reserved successfully. Please complete simulated payment to confirm your booking.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Get authenticated user's bookings
 * @access  Private
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details by ID (Owner or Admin)
 * @access  Private
 */
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify ownership or Admin privileges
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/bookings/:id/cancel
 * @desc    Cancel an eligible booking and release booked seats back to the pool
 * @access  Private
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Enforce ownership or Admin role
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to cancel this booking',
      });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled',
      });
    }

    // Release seats from Show document atomically
    await Show.updateOne(
      { _id: booking.show },
      {
        $pull: {
          bookedSeats: { $in: booking.seats },
          heldSeats: { seatNumber: { $in: booking.seats } },
        },
        $inc: { availableSeatsCount: booking.seats.length },
        $set: { status: 'OPEN' },
      }
    );

    // Update booking status
    booking.bookingStatus = 'CANCELLED';
    booking.cancellationDetails = {
      isCancelled: true,
      cancelledAt: new Date(),
      reason: req.body.reason || 'Customer cancellation request',
    };
    if (booking.paymentDetails?.status === 'PAID') {
      booking.paymentDetails.status = 'REFUNDED';
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking successfully cancelled and seats released',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bookings/admin/all
 * @desc    Administrator oversight of all bookings
 * @access  Private (Admin only)
 */
export const getAdminBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    if (search && search.trim() !== '') {
      query.bookingReference = new RegExp(search.trim(), 'i');
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limitNumber) || 1,
      currentPage: pageNumber,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};
