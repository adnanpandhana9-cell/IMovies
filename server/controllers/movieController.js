import Movie from '../models/Movie.js';

/**
 * @route   GET /api/movies
 * @desc    Get all movies with searching, filtering, and server-side pagination
 * @access  Public
 */
export const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      status,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    // Search query (case-insensitive title and description matching)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Genre filter
    if (genre && genre !== 'all') {
      query.genre = { $in: [new RegExp(genre.trim(), 'i')] };
    }

    // Language filter
    if (language && language !== 'all') {
      query.language = new RegExp(`^${language.trim()}$`, 'i');
    }

    // Status filter (e.g. NOW_SHOWING, COMING_SOON)
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / limitNumber) || 1,
      currentPage: pageNumber,
      limit: limitNumber,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/movies/:id
 * @desc    Get a single movie by ID
 * @access  Public
 */
export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found with the specified ID',
      });
    }

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/movies
 * @desc    Create a new movie
 * @access  Private (Admin only)
 */
export const createMovie = async (req, res, next) => {
  try {
    const movieData = { ...req.body };

    // Support comma-separated genre strings from form inputs
    if (typeof movieData.genre === 'string') {
      movieData.genre = movieData.genre
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
    }

    const movie = new Movie(movieData);
    await movie.save();

    res.status(201).json({
      success: true,
      message: 'Movie successfully created',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/movies/:id
 * @desc    Update a movie by ID
 * @access  Private (Admin only)
 */
export const updateMovie = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (typeof updateData.genre === 'string') {
      updateData.genre = updateData.genre
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found with the specified ID',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie successfully updated',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/movies/:id
 * @desc    Delete a movie by ID
 * @access  Private (Admin only)
 */
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found with the specified ID',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie successfully deleted',
      deletedId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
