import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <div className="im-card h-100 d-flex flex-column overflow-hidden position-relative">
      {/* Poster Image */}
      <div className="position-relative" style={{ height: '360px', overflow: 'hidden' }}>
        <img
          src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'}
          alt={movie.title}
          className="w-100 h-100 object-fit-cover transition-transform"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Status / Rating Badges */}
        <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-2">
          {movie.status === 'COMING_SOON' ? (
            <span className="badge bg-warning text-dark fw-bold px-2 py-1">COMING SOON</span>
          ) : (
            <span className="badge bg-danger fw-bold px-2 py-1">NOW SHOWING</span>
          )}
        </div>

        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge bg-dark bg-opacity-75 text-warning fw-bold px-2 py-1 border border-warning border-opacity-25">
            <i className="bi bi-star-fill me-1"></i>
            {movie.rating ? movie.rating.toFixed(1) : '8.0'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        <h5 className="fw-bold text-white mb-1 text-truncate" title={movie.title}>
          {movie.title}
        </h5>

        <div className="d-flex align-items-center gap-2 small text-secondary mb-2">
          <span><i className="bi bi-clock me-1"></i>{movie.duration} min</span>
          <span>&bull;</span>
          <span>{movie.language}</span>
        </div>

        {/* Genre Tags */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          {Array.isArray(movie.genre) &&
            movie.genre.slice(0, 3).map((g, idx) => (
              <span key={idx} className="badge bg-secondary bg-opacity-25 text-light small px-2 py-1">
                {g}
              </span>
            ))}
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-2">
          <Link to={`/movies/${movie._id}`} className="btn im-btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-ticket-perforated"></i>
            <span>Book Tickets</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
