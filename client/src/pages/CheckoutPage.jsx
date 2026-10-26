import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      setIsLoading(true);
      try {
        const data = await bookingService.getBookingById(bookingId);
        setBooking(data);

        // If already confirmed, redirect directly to confirmation ticket
        if (data.bookingStatus === 'CONFIRMED') {
          navigate(`/booking/confirmation/${data._id}`, { replace: true });
        }
      } catch (err) {
        console.error('Error loading booking checkout:', err);
        setErrorMessage('Failed to load booking. It may have expired.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const handleSimulatedPayment = async (simulateSuccess) => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await paymentService.processPayment({
        bookingId,
        paymentMethod,
        simulateSuccess,
      });

      if (res.success) {
        toast.success('Payment simulated successfully! Booking confirmed.');
        navigate(`/booking/confirmation/${bookingId}`, { replace: true });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Payment simulation failed.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      // Refresh booking status to reflect failure/expiration
      try {
        const updated = await bookingService.getBookingById(bookingId);
        setBooking(updated);
      } catch {
        // ignore
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading checkout...</span>
        </div>
      </div>
    );
  }

  if (errorMessage && !booking) {
    return (
      <div className="container py-5 text-center">
        <div className="im-card p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-clock-history text-danger display-4 mb-3"></i>
          <h4 className="text-white fw-bold mb-2">Reservation Not Available</h4>
          <p className="text-secondary mb-4">{errorMessage}</p>
          <Link to="/movies" className="btn im-btn-primary">
            Explore Movies
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = booking.bookingStatus === 'EXPIRED' || booking.bookingStatus === 'CANCELLED';

  return (
    <div className="container py-5">
      <div className="mb-4">
        <span className="badge bg-danger mb-2">SECURE CHECKOUT</span>
        <h2 className="fw-bold text-white mb-1">Confirm Your Reservation</h2>
        <p className="text-secondary small">
          Review booking details and complete the simulated transaction to finalize ticket issuance.
        </p>
      </div>

      {errorMessage && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{errorMessage}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Booking Summary Column */}
        <div className="col-lg-7">
          <div className="im-card p-4 mb-4">
            <h5 className="fw-bold text-white mb-3 pb-2 border-bottom border-secondary border-opacity-25">
              <i className="bi bi-ticket-detailed me-2 text-danger"></i> Screening Summary
            </h5>

            <div className="d-flex gap-3 mb-4">
              <img
                src={booking.movieSnapshot?.posterUrl}
                alt={booking.movieSnapshot?.title}
                className="rounded-3"
                style={{ width: '90px', height: '125px', objectFit: 'cover' }}
              />
              <div>
                <h4 className="fw-bold text-white mb-1">{booking.movieSnapshot?.title}</h4>
                <div className="text-secondary small mb-2">
                  <span>{booking.movieSnapshot?.duration} mins</span> &bull; <span>{booking.movieSnapshot?.language}</span>
                </div>
                <div className="d-flex align-items-center gap-2 small text-light">
                  <i className="bi bi-geo-alt text-danger"></i>
                  <span>{booking.theatreSnapshot?.name} &bull; {booking.theatreSnapshot?.screenName}</span>
                </div>
                <div className="d-flex align-items-center gap-2 small text-light mt-1">
                  <i className="bi bi-calendar-event text-danger"></i>
                  <span>{booking.showDetails?.showDate} at {booking.showDetails?.startTime}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--im-bg-card)', border: '1px solid var(--im-border)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary small">Booking Reference:</span>
                <span className="badge bg-dark border border-secondary text-light font-monospace">
                  {booking.bookingReference}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary small">Selected Seats:</span>
                <span className="text-white fw-bold">
                  {booking.seats?.join(', ')} ({booking.seats?.length} {booking.seats?.length === 1 ? 'seat' : 'seats'})
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary small">Reservation Status:</span>
                <span className={`badge ${booking.bookingStatus === 'PENDING_PAYMENT' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                  {booking.bookingStatus}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="pt-2">
              <div className="d-flex justify-content-between py-1 text-secondary small">
                <span>Seat Price ({booking.seats?.length} &times; ${booking.ticketPrice?.toFixed(2)})</span>
                <span>${booking.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between py-1 text-secondary small">
                <span>Convenience & Tech Fee</span>
                <span className="text-success">FREE (Academic Sandbox)</span>
              </div>
              <div className="d-flex justify-content-between py-2 mt-2 border-top border-secondary border-opacity-25 fs-5 fw-bold text-white">
                <span>Total Amount Due</span>
                <span className="text-danger">${booking.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Simulator Column */}
        <div className="col-lg-5">
          <div className="im-card p-4">
            <h5 className="fw-bold text-white mb-3 pb-2 border-bottom border-secondary border-opacity-25">
              <i className="bi bi-credit-card-2-front me-2 text-danger"></i> Simulated Payment
            </h5>

            <div className="alert alert-info py-2 px-3 small border-0 mb-4" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <i className="bi bi-info-circle-fill me-1"></i>
              <strong>Simulation Mode:</strong> This project uses an idempotent backend payment emulator. No real credit card or funds are required.
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4">
              <label className="form-label small text-secondary fw-semibold mb-2">Choose Payment Method</label>
              <div className="d-flex flex-column gap-2">
                <label className={`p-3 rounded border d-flex align-items-center gap-3 cursor-pointer ${paymentMethod === 'CARD' ? 'border-danger bg-danger bg-opacity-10' : 'border-secondary bg-dark'}`}>
                  <input
                    type="radio"
                    name="pm"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    disabled={isExpired}
                  />
                  <div>
                    <div className="fw-semibold text-white small">Credit / Debit Card</div>
                    <div className="text-secondary small">Simulated Visa / Mastercard / RuPay</div>
                  </div>
                </label>

                <label className={`p-3 rounded border d-flex align-items-center gap-3 cursor-pointer ${paymentMethod === 'UPI' ? 'border-danger bg-danger bg-opacity-10' : 'border-secondary bg-dark'}`}>
                  <input
                    type="radio"
                    name="pm"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    disabled={isExpired}
                  />
                  <div>
                    <div className="fw-semibold text-white small">UPI Instant Payment</div>
                    <div className="text-secondary small">Simulated QR / Virtual Payment Address</div>
                  </div>
                </label>

                <label className={`p-3 rounded border d-flex align-items-center gap-3 cursor-pointer ${paymentMethod === 'NET_BANKING' ? 'border-danger bg-danger bg-opacity-10' : 'border-secondary bg-dark'}`}>
                  <input
                    type="radio"
                    name="pm"
                    value="NET_BANKING"
                    checked={paymentMethod === 'NET_BANKING'}
                    onChange={() => setPaymentMethod('NET_BANKING')}
                    disabled={isExpired}
                  />
                  <div>
                    <div className="fw-semibold text-white small">Net Banking</div>
                    <div className="text-secondary small">Simulated Direct Bank Gateway</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            {isExpired ? (
              <div className="text-center py-3">
                <p className="text-danger small mb-3">This reservation has expired or failed.</p>
                <Link to={`/booking/seats/${booking.show}`} className="btn im-btn-primary w-100">
                  Select New Seats
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                <button
                  type="button"
                  className="btn im-btn-primary py-3 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => handleSimulatedPayment(true)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Processing Transaction...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>Simulate Successful Payment (${booking.totalAmount?.toFixed(2)})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm py-2"
                  onClick={() => handleSimulatedPayment(false)}
                  disabled={isProcessing}
                  title="Test how the system handles payment declines & seat releases"
                >
                  <i className="bi bi-x-circle me-1"></i> Simulate Payment Failure (Test Release)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
