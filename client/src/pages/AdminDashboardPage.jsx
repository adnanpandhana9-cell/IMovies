import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import movieService from '../services/movieService';
import theatreService from '../services/theatreService';
import showService from '../services/showService';
import bookingService from '../services/bookingService';
import { toast } from 'react-toastify';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data collections
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Modals / forms state
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New movie form state
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    genre: '',
    language: 'English',
    duration: 120,
    releaseDate: new Date().toISOString().split('T')[0],
    posterUrl: '',
    trailerUrl: '',
    rating: 8.0,
    status: 'NOW_SHOWING',
  });

  // New theatre form state
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    city: '',
    address: '',
    screenName: 'Screen 1',
    seatCapacity: 60,
  });

  // New show schedule form state
  const [showForm, setShowForm] = useState({
    movie: '',
    theatre: '',
    screenName: 'Screen 1',
    showDate: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '20:30',
    ticketPrice: 15.0,
  });

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await adminService.getStats();
      setStats(statsRes.stats);

      const [moviesRes, theatresRes, showsRes, bookingsRes] = await Promise.all([
        movieService.getMovies({ limit: 50 }),
        theatreService.getTheatres(),
        showService.getShows(),
        bookingService.getAdminBookings({ limit: 50 }),
      ]);

      setMovies(moviesRes.movies || []);
      setTheatres(theatresRes || []);
      setShows(showsRes || []);
      setBookings(bookingsRes.bookings || []);
    } catch (err) {
      console.error('Error loading admin suite:', err);
      toast.error('Failed to load administrator records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Handlers for Movie Creation & Deletion
  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      await movieService.createMovie(movieForm);
      toast.success('Movie created successfully.');
      setShowMovieModal(false);
      setMovieForm({
        title: '',
        description: '',
        genre: '',
        language: 'English',
        duration: 120,
        releaseDate: new Date().toISOString().split('T')[0],
        posterUrl: '',
        trailerUrl: '',
        rating: 8.0,
        status: 'NOW_SHOWING',
      });
      loadAllAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create movie.');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await movieService.deleteMovie(id);
      toast.success('Movie deleted successfully.');
      loadAllAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete movie.');
    }
  };

  // Handlers for Theatre Creation & Deletion
  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: theatreForm.name,
        city: theatreForm.city,
        address: theatreForm.address,
        screens: [
          {
            name: theatreForm.screenName,
            seatCapacity: parseInt(theatreForm.seatCapacity, 10) || 60,
          },
        ],
      };
      await theatreService.createTheatre(payload);
      toast.success('Theatre added successfully.');
      setShowTheatreModal(false);
      loadAllAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add theatre.');
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm('Delete this theatre location?')) return;
    try {
      await theatreService.deleteTheatre(id);
      toast.success('Theatre deleted successfully.');
      loadAllAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete theatre.');
    }
  };

  // Handlers for Show Creation & Deletion
  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      await showService.createShow(showForm);
      toast.success('Show scheduled successfully.');
      setShowScheduleModal(false);
      loadAllAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not schedule show.');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Are you sure you want to cancel or delete this show?')) return;
    try {
      await showService.deleteShow(id);
      toast.success('Show updated/removed.');
      loadAllAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete show.');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Dashboard Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <span className="badge bg-warning text-dark fw-bold mb-2">ADMINISTRATOR CONTROL ROOM</span>
          <h2 className="fw-bold text-white mb-0">Management Portal</h2>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-light btn-sm" onClick={loadAllAdminData}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          <button className="btn im-btn-primary btn-sm" onClick={() => setShowMovieModal(true)}>
            <i className="bi bi-plus-circle me-1"></i> Add Movie
          </button>
          <button className="btn btn-outline-light btn-sm" onClick={() => setShowTheatreModal(true)}>
            <i className="bi bi-building-add me-1"></i> Add Theatre
          </button>
          <button className="btn btn-outline-warning text-warning btn-sm" onClick={() => setShowScheduleModal(true)}>
            <i className="bi bi-calendar-plus me-1"></i> Schedule Show
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3 col-sm-6">
          <div className="im-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold">TOTAL MOVIES</span>
              <i className="bi bi-film text-danger fs-4"></i>
            </div>
            <h2 className="fw-bold text-white mb-0">{stats?.totalMovies || 0}</h2>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="im-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold">THEATRES</span>
              <i className="bi bi-geo-alt text-primary fs-4"></i>
            </div>
            <h2 className="fw-bold text-white mb-0">{stats?.totalTheatres || 0}</h2>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="im-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold">ACTIVE SHOWS</span>
              <i className="bi bi-calendar-check text-info fs-4"></i>
            </div>
            <h2 className="fw-bold text-white mb-0">{stats?.totalShows || 0}</h2>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="im-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold">TOTAL REVENUE</span>
              <i className="bi bi-cash-coin text-success fs-4"></i>
            </div>
            <h2 className="fw-bold text-white mb-0">${(stats?.totalRevenue || 0).toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Main Tabbed Interface */}
      <div className="im-card overflow-hidden">
        <div className="border-bottom border-secondary border-opacity-25 px-4 pt-3">
          <ul className="nav nav-tabs border-0 gap-2">
            <li className="nav-item">
              <button
                className={`nav-link border-0 fw-semibold ${activeTab === 'overview' ? 'active bg-transparent text-danger border-bottom border-danger border-3' : 'text-secondary'}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="bi bi-grid-fill me-2"></i>Movies ({movies.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 fw-semibold ${activeTab === 'theatres' ? 'active bg-transparent text-danger border-bottom border-danger border-3' : 'text-secondary'}`}
                onClick={() => setActiveTab('theatres')}
              >
                <i className="bi bi-building me-2"></i>Theatres ({theatres.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 fw-semibold ${activeTab === 'shows' ? 'active bg-transparent text-danger border-bottom border-danger border-3' : 'text-secondary'}`}
                onClick={() => setActiveTab('shows')}
              >
                <i className="bi bi-clock-history me-2"></i>Shows ({shows.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 fw-semibold ${activeTab === 'bookings' ? 'active bg-transparent text-danger border-bottom border-danger border-3' : 'text-secondary'}`}
                onClick={() => setActiveTab('bookings')}
              >
                <i className="bi bi-receipt me-2"></i>Bookings ({bookings.length})
              </button>
            </li>
          </ul>
        </div>

        <div className="p-4">
          {/* TAB 1: MOVIES */}
          {activeTab === 'overview' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-white mb-0">Movie Catalog Records</h5>
                <button className="btn im-btn-primary btn-sm" onClick={() => setShowMovieModal(true)}>
                  <i className="bi bi-plus me-1"></i> Add Movie
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead className="table-secondary text-secondary small">
                    <tr>
                      <th>Title</th>
                      <th>Genre</th>
                      <th>Language</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((m) => (
                      <tr key={m._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={m.posterUrl}
                              alt={m.title}
                              className="rounded"
                              style={{ width: '36px', height: '50px', objectFit: 'cover' }}
                            />
                            <span className="fw-semibold text-white">{m.title}</span>
                          </div>
                        </td>
                        <td>{Array.isArray(m.genre) ? m.genre.join(', ') : m.genre}</td>
                        <td>{m.language}</td>
                        <td>{m.duration}m</td>
                        <td>
                          <span className={`badge ${m.status === 'NOW_SHOWING' ? 'bg-success' : 'bg-warning text-dark'} small`}>
                            {m.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm p-1 px-2"
                            onClick={() => handleDeleteMovie(m._id)}
                            title="Delete Movie"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: THEATRES */}
          {activeTab === 'theatres' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-white mb-0">Theatres & Screen Layouts</h5>
                <button className="btn btn-outline-light btn-sm" onClick={() => setShowTheatreModal(true)}>
                  <i className="bi bi-plus me-1"></i> Add Theatre
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead className="table-secondary text-secondary small">
                    <tr>
                      <th>Theatre Name</th>
                      <th>City</th>
                      <th>Address</th>
                      <th>Screens</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {theatres.map((t) => (
                      <tr key={t._id}>
                        <td className="fw-semibold text-white">{t.name}</td>
                        <td>{t.city}</td>
                        <td>{t.address}</td>
                        <td>
                          {t.screens?.map((s) => (
                            <span key={s.name} className="badge bg-secondary me-1">
                              {s.name} ({s.seatCapacity} seats)
                            </span>
                          ))}
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm p-1 px-2"
                            onClick={() => handleDeleteTheatre(t._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SHOWS */}
          {activeTab === 'shows' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-white mb-0">Active Show Schedules</h5>
                <button className="btn btn-outline-warning text-warning btn-sm" onClick={() => setShowScheduleModal(true)}>
                  <i className="bi bi-plus me-1"></i> Schedule Show
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead className="table-secondary text-secondary small">
                    <tr>
                      <th>Movie</th>
                      <th>Theatre</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Price</th>
                      <th>Available</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shows.map((s) => (
                      <tr key={s._id}>
                        <td className="fw-semibold text-white">{s.movie?.title || 'Unknown'}</td>
                        <td>{s.theatre?.name} ({s.screenName})</td>
                        <td>{s.showDate}</td>
                        <td>{s.startTime} - {s.endTime}</td>
                        <td>${s.ticketPrice?.toFixed(2)}</td>
                        <td>
                          <span className="text-success fw-bold">{s.availableSeatsCount}</span> / {s.totalSeats}
                        </td>
                        <td>
                          <span className={`badge ${s.status === 'OPEN' ? 'bg-success' : 'bg-secondary'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm p-1 px-2"
                            onClick={() => handleDeleteShow(s._id)}
                            title="Cancel / Delete Show"
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div>
              <h5 className="fw-bold text-white mb-3">Platform Bookings Audit Log</h5>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead className="table-secondary text-secondary small">
                    <tr>
                      <th>Ref Code</th>
                      <th>Customer</th>
                      <th>Movie</th>
                      <th>Showtime</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id}>
                        <td className="font-monospace text-danger fw-bold">{b.bookingReference}</td>
                        <td>
                          <div>{b.user?.name || 'Customer'}</div>
                          <div className="small text-secondary">{b.user?.email}</div>
                        </td>
                        <td>{b.movieSnapshot?.title}</td>
                        <td>{b.showDetails?.showDate} {b.showDetails?.startTime}</td>
                        <td>{b.seats?.join(', ')}</td>
                        <td className="fw-bold text-white">${b.totalAmount?.toFixed(2)}</td>
                        <td>
                          <span
                            className={`badge ${
                              b.bookingStatus === 'CONFIRMED'
                                ? 'bg-success'
                                : b.bookingStatus === 'CANCELLED'
                                ? 'bg-secondary'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD MOVIE */}
      {showMovieModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark text-light border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-white">Add New Movie</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMovieModal(false)}></button>
              </div>
              <form onSubmit={handleCreateMovie}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small text-secondary">Movie Title</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        required
                        value={movieForm.title}
                        onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-secondary">Language</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        required
                        value={movieForm.language}
                        onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-secondary">Description / Synopsis</label>
                      <textarea
                        className="form-control bg-dark text-light border-secondary"
                        rows="3"
                        required
                        value={movieForm.description}
                        onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Genres (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        placeholder="Action, Sci-Fi, Thriller"
                        required
                        value={movieForm.genre}
                        onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small text-secondary">Duration (minutes)</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-light border-secondary"
                        min="1"
                        required
                        value={movieForm.duration}
                        onChange={(e) => setMovieForm({ ...movieForm, duration: parseInt(e.target.value, 10) })}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small text-secondary">Release Date</label>
                      <input
                        type="date"
                        className="form-control bg-dark text-light border-secondary"
                        required
                        value={movieForm.releaseDate}
                        onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label small text-secondary">Poster Image URL</label>
                      <input
                        type="url"
                        className="form-control bg-dark text-light border-secondary"
                        placeholder="https://..."
                        required
                        value={movieForm.posterUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-secondary">Status</label>
                      <select
                        className="form-select bg-dark text-light border-secondary"
                        value={movieForm.status}
                        onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                      >
                        <option value="NOW_SHOWING">NOW_SHOWING</option>
                        <option value="COMING_SOON">COMING_SOON</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowMovieModal(false)}>Cancel</button>
                  <button type="submit" className="btn im-btn-primary">Create Movie</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD THEATRE */}
      {showTheatreModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-light border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-white">Add Cinema Theatre</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowTheatreModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTheatre}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Theatre Name</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary"
                      required
                      placeholder="e.g. CineStar IMAX"
                      value={theatreForm.name}
                      onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">City</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary"
                      required
                      placeholder="e.g. Downtown"
                      value={theatreForm.city}
                      onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Address</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light border-secondary"
                      required
                      placeholder="100 Main Street"
                      value={theatreForm.address}
                      onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-8">
                      <label className="form-label small text-secondary">Screen Name</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        required
                        value={theatreForm.screenName}
                        onChange={(e) => setTheatreForm({ ...theatreForm, screenName: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small text-secondary">Seats</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-light border-secondary"
                        min="10"
                        max="200"
                        required
                        value={theatreForm.seatCapacity}
                        onChange={(e) => setTheatreForm({ ...theatreForm, seatCapacity: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowTheatreModal(false)}>Cancel</button>
                  <button type="submit" className="btn im-btn-primary">Add Theatre</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE SHOW */}
      {showScheduleModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-light border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-white">Schedule Movie Show</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowScheduleModal(false)}></button>
              </div>
              <form onSubmit={handleCreateShow}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Select Movie</label>
                    <select
                      className="form-select bg-dark text-light border-secondary"
                      required
                      value={showForm.movie}
                      onChange={(e) => setShowForm({ ...showForm, movie: e.target.value })}
                    >
                      <option value="">-- Choose Movie --</option>
                      {movies.map((m) => (
                        <option key={m._id} value={m._id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Select Theatre</label>
                    <select
                      className="form-select bg-dark text-light border-secondary"
                      required
                      value={showForm.theatre}
                      onChange={(e) => setShowForm({ ...showForm, theatre: e.target.value })}
                    >
                      <option value="">-- Choose Theatre --</option>
                      {theatres.map((t) => (
                        <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Screen Name</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        required
                        value={showForm.screenName}
                        onChange={(e) => setShowForm({ ...showForm, screenName: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Ticket Price ($)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="form-control bg-dark text-light border-secondary"
                        required
                        value={showForm.ticketPrice}
                        onChange={(e) => setShowForm({ ...showForm, ticketPrice: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Show Date (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      className="form-control bg-dark text-light border-secondary"
                      required
                      value={showForm.showDate}
                      onChange={(e) => setShowForm({ ...showForm, showDate: e.target.value })}
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Start Time (HH:MM)</label>
                      <input
                        type="time"
                        className="form-control bg-dark text-light border-secondary"
                        required
                        value={showForm.startTime}
                        onChange={(e) => setShowForm({ ...showForm, startTime: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">End Time (HH:MM)</label>
                      <input
                        type="time"
                        className="form-control bg-dark text-light border-secondary"
                        required
                        value={showForm.endTime}
                        onChange={(e) => setShowForm({ ...showForm, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                  <button type="submit" className="btn im-btn-primary">Schedule Show</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
