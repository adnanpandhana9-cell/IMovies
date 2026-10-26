import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container text-center py-5 my-5">
      <div className="display-1 fw-bold text-danger mb-3">404</div>
      <h2 className="fw-bold text-white mb-3">Scene Not Found</h2>
      <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '480px' }}>
        The page you are looking for doesn't exist, has been removed, or is part of a future implementation phase.
      </p>
      <Link to="/" className="btn im-btn-primary px-4 py-2">
        <i className="bi bi-house-door me-2"></i> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
