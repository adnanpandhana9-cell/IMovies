import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import { toast } from 'react-toastify';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load your booking history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Your seats will be released back to the auditorium.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await bookingService.cancelBooking(bookingId, 'Customer requested cancellation');
      toast.success('Booking cancelled and seats released successfully.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'CONFIRMED') return b.bookingStatus === 'CONFIRMED';
    if (activeTab === 'CANCELLED') return b.bookingStatus === 'CANCELLED';
    if (activeTab === 'PENDING') return b.bookingStatus === 'PENDING_PAYMENT';
    return true;
  });

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <span className="badge bg-danger mb-2">TICKET WALLET</span>
          <h2 className="fw-bold text-white mb-1">My Movie Tickets</h2>
          <p className="text-secondary small mb-0">View your active passes, show details, and manage cancellations.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="btn-group">
          <button
            className={`btn btn-sm ${activeTab === 'ALL' ? 'im-btn-primary' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('ALL')}
          >
            All ({bookings.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'CONFIRMED' ? 'im-btn-primary' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('CONFIRMED')}
          >
            Confirmed
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'CANCELLED' ? 'im-btn-primary' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('CANCELLED')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading tickets...</span>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="im-card p-5 text-center my-4">
          <i className="bi bi-ticket-perforated display-3 text-secondary mb-3"></i>
          <h4 className="fw-bold text-white mb-2">No Bookings Found</h4>
          <p className="text-secondary mb-4">
            {activeTab === 'ALL'
              ? "You haven't booked any movie tickets yet. Explore current releases and grab your premier seats."
              : `No bookings found with status '${activeTab}'.`}
          </p>
          <Link to="/movies" className="btn im-btn-primary">
            Explore Movies Now
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {filteredBookings.map((b) => (
            <div key={b._id} className="im-card p-4">
              <div className="row g-4 align-items-center">
                {/* Poster */}
                <div className="col-md-2 text-center text-md-start">
                  <img
                    src={b.movieSnapshot?.posterUrl}
                    alt={b.movieSnapshot?.title}
                    className="rounded-3 shadow"
                    style={{ width: '100px', height: '140px', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div className="col-md-7">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span
                      className={`badge ${
                        b.bookingStatus === 'CONFIRMED'
                          ? 'bg-success'
                          : b.bookingStatus === 'CANCELLED'
                          ? 'bg-secondary'
                          : 'bg-warning text-dark'
                      } small`}
                    >
                      {b.bookingStatus}
                    </span>
                    <span className="text-secondary small font-monospace">REF: {b.bookingReference}</span>
                  </div>

                  <h4 className="fw-bold text-white mb-1">{b.movieSnapshot?.title}</h4>

                  <div className="text-secondary small mb-2">
                    <i className="bi bi-geo-alt text-danger me-1"></i>
                    {b.theatreSnapshot?.name} &bull; {b.theatreSnapshot?.screenName} ({b.theatreSnapshot?.city})
                  </div>

                  <div className="d-flex flex-wrap gap-3 small text-light">
                    <span>
                      <i className="bi bi-calendar-event me-1 text-danger"></i>
                      {b.showDetails?.showDate} at {b.showDetails?.startTime}
                    </span>
                    <span>
                      <i className="bi bi-grid-3x3 me-1 text-danger"></i>
                      Seats: <strong className="text-danger">{b.seats?.join(', ')}</strong>
                    </span>
                    <span>
                      <i className="bi bi-cash-stack me-1 text-danger"></i>
                      Total: ${b.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-md-3 text-md-end d-flex flex-column gap-2">
                  {b.bookingStatus === 'CONFIRMED' && (
                    <>
                      <Link
                        to={`/booking/confirmation/${b._id}`}
                        className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center gap-1"
                      >
                        <i className="bi bi-eye"></i>
                        <span>View E-Ticket</span>
                      </Link>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancelBooking(b._id)}
                        disabled={cancellingId === b._id}
                      >
                        {cancellingId === b._id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    </>
                  )}

                  {b.bookingStatus === 'PENDING_PAYMENT' && (
                    <Link
                      to={`/checkout/${b._id}`}
                      className="btn im-btn-primary btn-sm d-flex align-items-center justify-content-center gap-1"
                    >
                      <i className="bi bi-credit-card"></i>
                      <span>Complete Payment</span>
                    </Link>
                  )}

                  {b.bookingStatus === 'CANCELLED' && (
                    <span className="text-muted small">
                      Cancelled on {b.cancellationDetails?.cancelledAt ? new Date(b.cancellationDetails.cancelledAt).toLocaleDateString() : 'N/A'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
