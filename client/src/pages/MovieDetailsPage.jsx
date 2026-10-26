import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import movieService from '../services/movieService';
import showService from '../services/showService';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadMovieDetailsAndShows = async () => {
      setIsLoading(true);
      try {
        const movieData = await movieService.getMovieById(id);
        setMovie(movieData);

        const showsData = await showService.getShows({ movie: id });
        setShows(showsData);

        // Extract dates and default to the first available date
        if (showsData.length > 0) {
          const uniqueDates = [...new Set(showsData.map((s) => s.showDate))].sort();
          setSelectedDate(uniqueDates[0]);
        }
      } catch (err) {
        console.error('Error loading movie details:', err);
        setErrorMessage('Failed to load movie details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMovieDetailsAndShows();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading movie...</span>
        </div>
      </div>
    );
  }

  if (errorMessage || !movie) {
    return (
      <div className="container py-5 text-center">
        <div className="im-card p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-exclamation-triangle text-warning display-4 mb-3"></i>
          <h4 className="text-white fw-bold">{errorMessage || 'Movie Not Found'}</h4>
          <Link to="/movies" className="btn im-btn-primary mt-3">
            Browse All Movies
          </Link>
        </div>
      </div>
    );
  }

  // Get distinct dates available for this movie
  const availableDates = [...new Set(shows.map((s) => s.showDate))].sort();

  // Filter shows by selected date
  const filteredShows = selectedDate
    ? shows.filter((s) => s.showDate === selectedDate)
    : shows;

  // Group shows by Theatre
  const showsByTheatre = filteredShows.reduce((acc, show) => {
    const theatreId = show.theatre?._id || 'unknown';
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatre,
        shows: [],
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {});

  return (
    <div>
      {/* Movie Hero Header */}
      <section
        className="py-5"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(229, 9, 20, 0.15) 0%, rgba(11, 15, 25, 0.95) 70%)',
          borderBottom: '1px solid var(--im-border)',
        }}
      >
        <div className="container">
          <div className="row g-4 align-items-center">
            {/* Poster */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="img-fluid rounded-3 shadow-lg"
                style={{ maxHeight: '420px', objectFit: 'cover' }}
              />
            </div>

            {/* Details */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger px-3 py-1 fw-bold">{movie.status}</span>
                <span className="badge bg-dark border border-warning text-warning px-3 py-1 fw-bold">
                  <i className="bi bi-star-fill me-1"></i>
                  {movie.rating ? movie.rating.toFixed(1) : '8.5'}/10
                </span>
                <span className="text-secondary small">
                  <i className="bi bi-calendar3 me-1"></i>
                  {new Date(movie.releaseDate).toLocaleDateString()}
                </span>
              </div>

              <h1 className="display-5 fw-extrabold text-white mb-2">{movie.title}</h1>

              <div className="d-flex align-items-center gap-3 text-secondary mb-3">
                <span><i className="bi bi-clock me-1 text-danger"></i>{movie.duration} minutes</span>
                <span>&bull;</span>
                <span><i className="bi bi-translate me-1 text-danger"></i>{movie.language}</span>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-4">
                {Array.isArray(movie.genre) &&
                  movie.genre.map((g, idx) => (
                    <span key={idx} className="badge bg-dark border border-secondary text-light px-3 py-2">
                      {g}
                    </span>
                  ))}
              </div>

              <h6 className="text-white fw-bold mb-2">Synopsis</h6>
              <p className="text-secondary lead fs-6 mb-4" style={{ maxWidth: '780px' }}>
                {movie.description}
              </p>

              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-play-circle-fill text-danger fs-5"></i>
                  <span>Watch Trailer</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Showtimes & Theatres Section */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
            <div>
              <h3 className="fw-bold text-white mb-1">Select Theatrical Showtime</h3>
              <p className="text-secondary small mb-0">Choose your preferred screening time to select seats.</p>
            </div>

            {/* Date Selector Tabs */}
            {availableDates.length > 0 && (
              <div className="d-flex gap-2 overflow-auto pb-2">
                {availableDates.map((dateStr) => {
                  const dateObj = new Date(dateStr + 'T00:00:00');
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                  return (
                    <button
                      key={dateStr}
                      className={`btn btn-sm px-3 py-2 text-center rounded-3 ${
                        selectedDate === dateStr ? 'im-btn-primary' : 'im-btn-outline'
                      }`}
                      onClick={() => setSelectedDate(dateStr)}
                    >
                      <div className="fw-bold small">{dayName}</div>
                      <div className="small">{dayNum}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Show List */}
          {shows.length === 0 ? (
            <div className="im-card p-5 text-center">
              <i className="bi bi-calendar-x display-4 text-secondary mb-3"></i>
              <h5 className="text-white fw-bold">No Scheduled Screenings Found</h5>
              <p className="text-secondary">
                There are no upcoming showtimes currently scheduled for this title. Please check back soon or explore other movies.
              </p>
              <Link to="/movies" className="btn btn-outline-light btn-sm mt-2">
                Browse Movies
              </Link>
            </div>
          ) : Object.keys(showsByTheatre).length === 0 ? (
            <div className="im-card p-4 text-center">
              <p className="text-secondary mb-0">No shows available for the selected date.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {Object.values(showsByTheatre).map(({ theatre, shows }) => (
                <div key={theatre?._id || Math.random()} className="im-card p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3 border-bottom border-secondary border-opacity-25 pb-3">
                    <div>
                      <h5 className="fw-bold text-white mb-1">
                        <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                        {theatre?.name || 'Local Cinema'}
                      </h5>
                      <span className="text-secondary small">
                        {theatre?.address}, {theatre?.city}
                      </span>
                    </div>
                  </div>

                  {/* Showtime Buttons */}
                  <div className="d-flex flex-wrap gap-3">
                    {shows.map((show) => (
                      <Link
                        key={show._id}
                        to={`/booking/seats/${show._id}`}
                        className="btn btn-outline-light p-3 text-start rounded-3 d-flex flex-column gap-1 transition-all"
                        style={{ minWidth: '150px', borderColor: 'var(--im-border)' }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold fs-5 text-white">{show.startTime}</span>
                          <span className="badge bg-danger bg-opacity-25 text-danger small">
                            ${show.ticketPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="small text-secondary">{show.screenName}</div>
                        <div className="small text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          {show.availableSeatsCount} seats left
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MovieDetailsPage;
