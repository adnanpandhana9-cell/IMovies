import React from 'react';

const Footer = () => {
  return (
    <footer className="border-top py-5 mt-auto" style={{ borderColor: 'var(--im-border)', backgroundColor: 'var(--im-bg-surface)' }}>
      <div className="container">
        <div className="row g-4 justify-content-between align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
              <span className="brand-badge">IMOVE</span>
              <span className="fw-bold fs-5 text-white">IMovies</span>
            </div>
            <p className="text-secondary small mb-0">
              Movie Ticket Booking Made Simple. Full-Stack Academic Project Architecture.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-2 mb-2">
              <span className="badge bg-dark border text-light p-2">React 18</span>
              <span className="badge bg-dark border text-light p-2">Vite</span>
              <span className="badge bg-dark border text-light p-2">Bootstrap 5</span>
              <span className="badge bg-dark border text-light p-2">Express.js</span>
              <span className="badge bg-dark border text-light p-2">MongoDB Atlas</span>
            </div>
            <p className="text-muted small mb-0">
              Phase 1: Foundation & Scaffold Verified &bull; &copy; {new Date().getFullYear()} IMovies
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
