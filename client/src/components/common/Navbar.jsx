import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Navbar = ({ healthStatus }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const isApiOnline = healthStatus?.online;
  const isDbConnected = healthStatus?.data?.database?.connected;

  const handleLogout = () => {
    logout();
    toast.info('You have logged out successfully.');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark im-navbar sticky-top py-3">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="brand-badge">IMOVE</span>
          <span className="fw-bold fs-4 text-white">IMovies</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#imoviesNavbar"
          aria-controls="imoviesNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="imoviesNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-2">
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/movies">
                <i className="bi bi-film me-1"></i> Movies
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link text-light px-3" to="/my-bookings">
                  <i className="bi bi-ticket-perforated me-1"></i> My Tickets
                </Link>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link text-warning px-3 fw-semibold" to="/admin">
                  <i className="bi bi-speedometer2 me-1"></i> Admin Portal
                </Link>
              </li>
            )}
          </ul>

          {/* Right Section: System Diagnostics Status & Auth */}
          <div className="d-flex align-items-center gap-3">
            {/* Live Database/API status pill */}
            <div
              className={`status-pill ${
                isDbConnected ? 'connected' : isApiOnline ? 'warning' : 'error'
              }`}
              title={
                isDbConnected
                  ? 'MongoDB Atlas: Connected'
                  : isApiOnline
                  ? 'Backend: Online | MongoDB: Disconnected (Set MONGODB_URI)'
                  : 'Backend: Offline (Check port 5000)'
              }
            >
              <span
                className={`status-dot ${
                  isDbConnected ? 'connected' : isApiOnline ? 'warning' : 'error'
                }`}
              ></span>
              <span className="d-none d-lg-inline">
                {isDbConnected
                  ? 'Atlas Connected'
                  : isApiOnline
                  ? 'DB Disconnected'
                  : 'API Offline'}
              </span>
            </div>

            {/* User Authentication Navigation */}
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="/profile"
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3 py-1"
                  title="View Account Profile"
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{user?.name?.split(' ')[0]}</span>
                  {isAdmin && (
                    <span className="badge bg-warning text-dark px-2 py-1 small">ADMIN</span>
                  )}
                </Link>
                <button
                  className="btn btn-outline-danger btn-sm px-2 py-1"
                  onClick={handleLogout}
                  title="Log Out"
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn im-btn-primary btn-sm px-3 py-1">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-sm px-3 py-1">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
