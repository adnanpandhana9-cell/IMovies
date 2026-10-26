import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Please provide at least one genre',
      },
      index: true,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
      index: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true,
    },
    trailerUrl: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [10, 'Rating cannot exceed 10'],
      default: 8.0,
    },
    status: {
      type: String,
      enum: {
        values: ['NOW_SHOWING', 'COMING_SOON', 'ARCHIVED'],
        message: 'Status must be NOW_SHOWING, COMING_SOON, or ARCHIVED',
      },
      default: 'NOW_SHOWING',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for robust full-text search across titles, descriptions, and genres
movieSchema.index({
  title: 'text',
  description: 'text',
  language: 'text',
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
