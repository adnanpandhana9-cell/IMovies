import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';

/**
 * Checks if two time intervals overlap (times formatted as 'HH:MM')
 */
const timesOverlap = (startA, endA, startB, endB) => {
  return startA < endB && endA > startB;
};

/**
 * @route   GET /api/shows
 * @desc    Get shows with filtering by movie, theatre, date, and city
 * @access  Public
 */
export const getShows = async (req, res, next) => {
  try {
    const { movie, theatre, date, city, status } = req.query;
    const query = {};

    if (movie) query.movie = movie;
    if (theatre) query.theatre = theatre;
    if (date) query.showDate = date;
    if (status) query.status = status;
    else query.status = { $ne: 'CANCELLED' };

    // If city is requested, find theatre IDs matching the city
    if (city && city !== 'all') {
      const cityTheatres = await Theatre.find({
        city: new RegExp(`^${city.trim()}$`, 'i'),
      }).select('_id');
      query.theatre = { $in: cityTheatres.map((t) => t._id) };
    }

    const shows = await Show.find(query)
      .populate('movie', 'title posterUrl duration language genre rating')
      .populate('theatre', 'name city address screens')
      .sort({ showDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/shows/:id
 * @desc    Get single show details with live seat availability & screen layout
 * @access  Public
 */
export const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie', 'title posterUrl duration language genre rating')
      .populate('theatre', 'name city address screens');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    // Filter out expired held seats in memory
    const now = new Date();
    const activeHeldSeats = show.heldSeats.filter(
      (h) => new Date(h.expiresAt) > now
    );

    // Retrieve theatre screen configuration for seat map layout
    const screenConfig = show.theatre?.screens?.find(
      (s) => s.name === show.screenName
    ) || {
      name: show.screenName,
      rows: ['A', 'B', 'C', 'D', 'E', 'F'],
      seatsPerRow: 10,
      seatCapacity: 60,
    };

    res.status(200).json({
      success: true,
      show,
      activeHeldSeats: activeHeldSeats.map((h) => ({
        seatNumber: h.seatNumber,
        heldBy: h.heldBy,
      })),
      screenConfig: {
        rows: screenConfig.rows,
        seatsPerRow: screenConfig.seatsPerRow,
        totalSeats: screenConfig.seatCapacity || show.totalSeats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/shows
 * @desc    Create a new movie show with schedule overlap validation
 * @access  Private (Admin only)
 */
export const createShow = async (req, res, next) => {
  try {
    const {
      movie: movieId,
      theatre: theatreId,
      screenName,
      showDate,
      startTime,
      endTime,
      ticketPrice,
    } = req.body;

    // Validate movie existence
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie reference: Movie does not exist',
      });
    }

    // Validate theatre existence and screen configuration
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theatre reference: Theatre does not exist',
      });
    }

    const screen = theatre.screens.find((s) => s.name === screenName);
    const capacity = screen ? screen.seatCapacity : 60;

    // Validate start time < end time
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be earlier than end time',
      });
    }

    // Prevent scheduling conflicts / overlapping shows on the same screen
    const existingShows = await Show.find({
      theatre: theatreId,
      screenName,
      showDate,
      status: { $ne: 'CANCELLED' },
    });

    const conflict = existingShows.find((s) =>
      timesOverlap(startTime, endTime, s.startTime, s.endTime)
    );

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `Scheduling conflict: ${screenName} already has an active show scheduled from ${conflict.startTime} to ${conflict.endTime}`,
      });
    }

    const show = new Show({
      movie: movieId,
      theatre: theatreId,
      screenName,
      showDate,
      startTime,
      endTime,
      ticketPrice,
      totalSeats: capacity,
      availableSeatsCount: capacity,
      bookedSeats: [],
      heldSeats: [],
      status: 'OPEN',
    });

    await show.save();

    res.status(201).json({
      success: true,
      message: 'Show scheduled successfully',
      show,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/shows/:id
 * @desc    Update show information with schedule conflict checking
 * @access  Private (Admin only)
 */
export const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    const {
      screenName = show.screenName,
      showDate = show.showDate,
      startTime = show.startTime,
      endTime = show.endTime,
      ticketPrice = show.ticketPrice,
      status = show.status,
    } = req.body;

    // Check overlap if times or date changed
    if (
      screenName !== show.screenName ||
      showDate !== show.showDate ||
      startTime !== show.startTime ||
      endTime !== show.endTime
    ) {
      const existingShows = await Show.find({
        _id: { $ne: show._id },
        theatre: show.theatre,
        screenName,
        showDate,
        status: { $ne: 'CANCELLED' },
      });

      const conflict = existingShows.find((s) =>
        timesOverlap(startTime, endTime, s.startTime, s.endTime)
      );

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: `Scheduling conflict: ${screenName} already has an active show from ${conflict.startTime} to ${conflict.endTime}`,
        });
      }
    }

    show.screenName = screenName;
    show.showDate = showDate;
    show.startTime = startTime;
    show.endTime = endTime;
    show.ticketPrice = ticketPrice;
    show.status = status;

    await show.save();

    res.status(200).json({
      success: true,
      message: 'Show updated successfully',
      show,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/shows/:id
 * @desc    Delete or cancel a show
 * @access  Private (Admin only)
 */
export const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    // If bookings already exist, prevent hard deletion to preserve booking audit history
    if (show.bookedSeats && show.bookedSeats.length > 0) {
      show.status = 'CANCELLED';
      await show.save();
      return res.status(200).json({
        success: true,
        message: 'Show marked as CANCELLED because existing booked seats were recorded',
        show,
      });
    }

    await Show.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Show deleted successfully',
      deletedId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
