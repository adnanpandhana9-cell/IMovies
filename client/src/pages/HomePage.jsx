import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import movieService from '../services/movieService';
import MovieCard from '../components/common/MovieCard';

const HomePage = ({ healthStatus, onRefreshHealth, isChecking }) => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  const isApiOnline = healthStatus?.online;
  const db = healthStatus?.data?.database;
  const isDbConnected = db?.connected;

  useEffect(() => {
    const loadFeaturedMovies = async () => {
      try {
        const res = await movieService.getMovies({ limit: 4, status: 'NOW_SHOWING' });
        setFeaturedMovies(res.movies || []);
      } catch (err) {
        console.error('Error loading featured movies for home page:', err);
      } finally {
        setLoadingMovies(false);
      }
    };

    loadFeaturedMovies();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-center">
        <div className="container py-4">
          <div className="badge px-3 py-2 mb-3 rounded-pill bg-danger bg-opacity-25 border border-danger text-danger-emphasis fw-semibold">
            🎬 Next-Gen Cinema Experience
          </div>
          <h1 className="display-4 fw-extrabold text-white mb-3">
            Movie Ticket Booking <span style={{ color: 'var(--im-primary)' }}>Made Simple</span>
          </h1>
          <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '680px' }}>
            Book premier seats, explore blockbuster movies, and experience seamless cinema ticketing with real-time seat locks and instant confirmations.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/movies" className="btn im-btn-primary px-4 py-2 d-flex align-items-center gap-2">
              <i className="bi bi-film"></i>
              <span>Explore All Movies</span>
            </Link>
            <button className="btn im-btn-outline px-4 py-2" onClick={onRefreshHealth} disabled={isChecking}>
              <i className={`bi bi-arrow-clockwise me-2 ${isChecking ? 'spin' : ''}`}></i>
              {isChecking ? 'Checking System...' : 'Verify System Status'}
            </button>
          </div>
        </div>
      </section>

      {/* Featured / Now Showing Section */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="badge bg-danger mb-2">NOW SHOWING</span>
              <h2 className="fw-bold text-white mb-0">Featured Blockbusters</h2>
            </div>
            <Link to="/movies" className="text-danger fw-semibold text-decoration-none small">
              View All Movies &rarr;
            </Link>
          </div>

          {loadingMovies ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading featured movies...</span>
              </div>
            </div>
          ) : featuredMovies.length === 0 ? (
            <div className="im-card p-4 text-center">
              <p className="text-secondary mb-0">No movies currently showing. Run the seed script to populate sample cinema titles.</p>
            </div>
          ) : (
            <div className="row g-4 mb-5">
              {featuredMovies.map((movie) => (
                <div key={movie._id} className="col-12 col-sm-6 col-md-3">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          )}

          {/* System Health Status Box */}
          <div id="system-status" className="im-card p-4 p-md-5 mb-5 shadow-lg">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
              <div>
                <span className="badge bg-success bg-opacity-25 text-success border border-success px-3 py-1 rounded-pill mb-2">
                  System Diagnostics
                </span>
                <h3 className="fw-bold text-white mb-1">Architecture & Database Health</h3>
                <p className="text-secondary small mb-0">
                  Live verification of Express.js REST API and MongoDB Atlas persistent storage.
                </p>
              </div>
              <button
                className="btn btn-sm btn-outline-light d-flex align-items-center gap-2"
                onClick={onRefreshHealth}
                disabled={isChecking}
              >
                <i className={`bi bi-arrow-clockwise ${isChecking ? 'spin' : ''}`}></i>
                <span>Refresh Diagnostics</span>
              </button>
            </div>

            <div className="row g-4">
              {/* Backend API Service Status */}
              <div className="col-md-6">
                <div className="p-4 rounded-3 h-100" style={{ backgroundColor: 'var(--im-bg-card)', border: '1px solid var(--im-border)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-server fs-4 text-primary"></i>
                      <h5 className="mb-0 fw-semibold text-white">Express Backend API</h5>
                    </div>
                    <span className={`badge ${isApiOnline ? 'bg-success' : 'bg-danger'} px-3 py-2`}>
                      {isApiOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>

                  <p className="text-secondary small mb-3">
                    REST API server configured with Helmet security headers, rate limiting, and centralized error handling.
                  </p>

                  <ul className="list-unstyled small text-secondary mb-0">
                    <li className="mb-2 d-flex justify-content-between">
                      <span>API Health Status:</span>
                      <strong className={isApiOnline ? 'text-success' : 'text-danger'}>
                        {isApiOnline ? 'Healthy' : 'Unreachable'}
                      </strong>
                    </li>
                    <li className="mb-2 d-flex justify-content-between">
                      <span>Environment:</span>
                      <strong className="text-light">
                        {isApiOnline ? healthStatus?.data?.environment : 'Unavailable'}
                      </strong>
                    </li>
                    <li className="d-flex justify-content-between">
                      <span>Uptime:</span>
                      <strong className="text-light">
                        {isApiOnline && healthStatus?.data?.uptime !== undefined
                          ? `${healthStatus.data.uptime}s`
                          : 'Unavailable'}
                      </strong>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Database Connection Status */}
              <div className="col-md-6">
                <div className="p-4 rounded-3 h-100" style={{ backgroundColor: 'var(--im-bg-card)', border: '1px solid var(--im-border)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-database fs-4 text-info"></i>
                      <h5 className="mb-0 fw-semibold text-white">MongoDB Atlas</h5>
                    </div>
                    <span
                      className={`badge ${
                        isDbConnected ? 'bg-success' : isApiOnline ? 'bg-warning text-dark' : 'bg-danger'
                      } px-3 py-2`}
                    >
                      {isDbConnected ? 'CONNECTED' : isApiOnline ? 'DISCONNECTED' : 'UNAVAILABLE'}
                    </span>
                  </div>

                  <p className="text-secondary small mb-3">
                    Persistent cloud document database. No mock arrays or local browser storage.
                  </p>

                  <ul className="list-unstyled small text-secondary mb-3">
                    <li className="mb-2 d-flex justify-content-between">
                      <span>Connection State:</span>
                      <strong className={isDbConnected ? 'text-success' : isApiOnline ? 'text-warning' : 'text-danger'}>
                        {isApiOnline ? (db?.state || 'disconnected') : 'Unavailable'}
                      </strong>
                    </li>
                    {isDbConnected && (
                      <>
                        <li className="mb-2 d-flex justify-content-between">
                          <span>Cluster Host:</span>
                          <strong className="text-light">{db?.host || 'MongoDB Atlas'}</strong>
                        </li>
                        <li className="d-flex justify-content-between">
                          <span>Database Name:</span>
                          <strong className="text-light">{db?.name || 'imovies'}</strong>
                        </li>
                      </>
                    )}
                  </ul>

                  {isDbConnected ? (
                    <div className="alert alert-success py-2 px-3 small mb-0 border-0" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                      <i className="bi bi-check-circle-fill me-2"></i>
                      MongoDB Atlas is fully connected and operational!
                    </div>
                  ) : isApiOnline ? (
                    <div className="alert alert-warning py-2 px-3 small mb-0 border-0" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <strong>Action Required:</strong> MongoDB Atlas is disconnected. Verify database connection string.
                    </div>
                  ) : (
                    <div className="alert alert-danger py-2 px-3 small mb-0 border-0" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                      <i className="bi bi-exclamation-circle-fill me-2"></i>
                      Unable to contact the backend API server.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
