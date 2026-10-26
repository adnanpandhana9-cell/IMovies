import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/');
  };

  return (
    <div className="container py-5 my-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="im-card p-4 p-md-5 shadow-lg">
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-25">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white fs-4"
                  style={{
                    width: '56px',
                    height: '56px',
                    background: isAdmin
                      ? 'linear-gradient(135deg, #f5c518 0%, #d4a017 100%)'
                      : 'linear-gradient(135deg, #e50914 0%, #b80710 100%)',
                    boxShadow: isAdmin
                      ? '0 4px 14px rgba(245, 197, 24, 0.4)'
                      : '0 4px 14px rgba(229, 9, 20, 0.4)',
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="fw-bold text-white mb-0">{user?.name}</h4>
                  <span className="text-secondary small">{user?.email}</span>
                </div>
              </div>

              <span
                className={`badge ${
                  isAdmin ? 'bg-warning text-dark' : 'bg-primary'
                } px-3 py-2 fw-semibold`}
              >
                <i className={`bi ${isAdmin ? 'bi-shield-check' : 'bi-person-fill'} me-1`}></i>
                {user?.role}
              </span>
            </div>

            {/* Profile Details */}
            <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--im-bg-card)', border: '1px solid var(--im-border)' }}>
              <h6 className="text-white fw-bold mb-3">
                <i className="bi bi-person-badge me-2 text-danger"></i> Account Information
              </h6>
              <ul className="list-unstyled small text-secondary mb-0">
                <li className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-10">
                  <span>Account ID:</span>
                  <span className="text-light font-monospace">{user?._id || user?.id || 'N/A'}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-10">
                  <span>Full Name:</span>
                  <span className="text-light fw-semibold">{user?.name}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-10">
                  <span>Email Address:</span>
                  <span className="text-light">{user?.email}</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-10">
                  <span>Account Role:</span>
                  <span className={isAdmin ? 'text-warning fw-semibold' : 'text-info fw-semibold'}>
                    {user?.role}
                  </span>
                </li>
                <li className="d-flex justify-content-between py-2">
                  <span>Member Since:</span>
                  <span className="text-light">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="d-flex gap-3">
              <button className="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
