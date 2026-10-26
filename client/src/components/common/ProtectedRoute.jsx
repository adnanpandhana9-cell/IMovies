import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="im-card p-5 mx-auto" style={{ maxWidth: '540px' }}>
          <div className="display-4 text-warning mb-3">
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <h3 className="fw-bold text-white mb-2">Administrator Access Required</h3>
          <p className="text-secondary mb-4">
            You do not have administrative privileges to view this control room.
          </p>
          <a href="/" className="btn im-btn-primary">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
