import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import bookingService from '../services/bookingService';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfirmedBooking = async () => {
      try {
        const data = await bookingService.getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        console.error('Error loading confirmed booking:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfirmedBooking();
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading ticket...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-white">Booking Not Found</h4>
        <Link to="/movies" className="btn im-btn-primary mt-3">Back to Movies</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header Notification */}
      <div className="text-center mb-5">
        <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-25 text-success mb-3">
          <i className="bi bi-check-lg display-4"></i>
        </div>
        <h2 className="fw-extrabold text-white mb-2">Booking Confirmed!</h2>
        <p className="text-secondary small mx-auto" style={{ maxWidth: '500px' }}>
          Your seats are reserved and your electronic ticket is ready. Present this reference at the theatre entrance.
        </p>
      </div>

      {/* Digital Ticket Card */}
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div
            className="im-card overflow-hidden shadow-lg border-danger border-opacity-50"
            style={{
              background: 'linear-gradient(145deg, #111827 0%, #1a2234 100%)',
            }}
          >
            {/* Top Red Bar */}
            <div className="bg-danger py-2 px-4 d-flex justify-content-between align-items-center text-white small fw-bold">
              <span>IMOVE CINEMA PASS</span>
              <span className="font-monospace">REF: {booking.bookingReference}</span>
            </div>

            <div className="p-4 p-md-5">
              <div className="row g-4 align-items-center">
                {/* Poster */}
                <div className="col-md-4 text-center">
                  <img
                    src={booking.movieSnapshot?.posterUrl}
                    alt={booking.movieSnapshot?.title}
                    className="img-fluid rounded-3 shadow"
                    style={{ maxHeight: '240px', objectFit: 'cover' }}
                  />
                </div>

                {/* Ticket Details */}
                <div className="col-md-8">
                  <span className="badge bg-danger mb-2">CONFIRMED SEATS</span>
                  <h3 className="fw-bold text-white mb-1">{booking.movieSnapshot?.title}</h3>
                  <p className="text-secondary small mb-3">
                    {booking.movieSnapshot?.duration} mins &bull; {booking.movieSnapshot?.language}
                  </p>

                  <div className="row g-3 small">
                    <div className="col-sm-6">
                      <div className="text-secondary">Theatre</div>
                      <div className="text-white fw-semibold">{booking.theatreSnapshot?.name}</div>
                      <div className="text-muted small">{booking.theatreSnapshot?.city}</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-secondary">Auditorium Screen</div>
                      <div className="text-white fw-semibold">{booking.theatreSnapshot?.screenName}</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-secondary">Date & Time</div>
                      <div className="text-white fw-semibold">
                        {booking.showDetails?.showDate} at {booking.showDetails?.startTime}
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-secondary">Seats ({booking.seats?.length})</div>
                      <div className="text-danger fw-bold fs-5">
                        {booking.seats?.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Perforation Line Effect */}
              <div
                className="my-4"
                style={{
                  borderTop: '2px dashed var(--im-border)',
                  position: 'relative',
                }}
              ></div>

              {/* Transaction & Barcode Section */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                <div>
                  <div className="small text-secondary">Transaction ID</div>
                  <div className="text-light small font-monospace">
                    {booking.paymentDetails?.transactionId || 'TXN-SIMULATED'}
                  </div>
                  <div className="small text-secondary mt-1">
                    Total Paid: <strong className="text-white">${booking.totalAmount?.toFixed(2)}</strong> via {booking.paymentDetails?.paymentMethod}
                  </div>
                </div>

                {/* Simulated QR Code Box */}
                <div className="text-center p-2 rounded bg-white text-dark d-inline-block">
                  <i className="bi bi-qr-code fs-1 d-block text-dark"></i>
                  <small className="fw-bold text-dark font-monospace" style={{ fontSize: '10px' }}>
                    {booking.bookingReference}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
            <button className="btn btn-outline-light d-flex align-items-center gap-2" onClick={() => window.print()}>
              <i className="bi bi-printer"></i>
              <span>Print Ticket</span>
            </button>
            <Link to="/my-bookings" className="btn im-btn-primary d-flex align-items-center gap-2">
              <i className="bi bi-ticket-perforated"></i>
              <span>View All My Bookings</span>
            </Link>
            <Link to="/movies" className="btn im-btn-outline">
              Browse More Movies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
