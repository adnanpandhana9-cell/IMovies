import test from 'node:test';
import assert from 'node:assert/strict';
import Movie from '../models/Movie.js';
import { getMovies, getMovieById, createMovie } from '../controllers/movieController.js';

test('Movie model validates required fields and generates clean document', () => {
  const movie = new Movie({
    title: 'Test Movie',
    description: 'A test film synopsis for unit testing.',
    genre: ['Action', 'Thriller'],
    language: 'English',
    duration: 120,
    releaseDate: new Date('2024-01-01'),
    posterUrl: 'https://example.com/poster.jpg',
  });

  const err = movie.validateSync();
  assert.equal(err, undefined);
  assert.equal(movie.status, 'NOW_SHOWING');
});

test('Movie model validation rejects negative or zero duration', () => {
  const movie = new Movie({
    title: 'Invalid Duration Movie',
    description: 'A test film.',
    genre: ['Drama'],
    language: 'English',
    duration: 0,
    releaseDate: new Date(),
    posterUrl: 'https://example.com/poster.jpg',
  });

  const err = movie.validateSync();
  assert.ok(err.errors.duration);
});

test('getMovies controller applies pagination and search filters cleanly', async () => {
  const originalFind = Movie.find;
  const originalCount = Movie.countDocuments;

  Movie.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: async () => [
          { title: 'Inception', genre: ['Sci-Fi'] },
          { title: 'Interstellar', genre: ['Sci-Fi'] },
        ],
      }),
    }),
  });
  Movie.countDocuments = async () => 2;

  const req = {
    query: { search: 'Sci', page: 1, limit: 10 },
  };

  let responseStatus = null;
  let responseData = null;

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  try {
    await getMovies(req, res, () => {});
    assert.equal(responseStatus, 200);
    assert.equal(responseData.success, true);
    assert.equal(responseData.count, 2);
    assert.equal(responseData.total, 2);
  } finally {
    Movie.find = originalFind;
    Movie.countDocuments = originalCount;
  }
});
