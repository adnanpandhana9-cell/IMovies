import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import showService from '../services/showService';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [show, setShow] = useState(null);
  const [screenConfig, setScreenConfig] = useState({
    rows: ['A', 'B', 'C', 'D', 'E', 'F'],
    seatsPerRow: 10,
  });
  const [bookedSeats, setBookedSeats] = useState([]);
  const [heldSeats, setHeldSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchShowDetails = async () => {
      setIsLoading(true);
      try {
        const data = await showService.getShowById(showId);
        setShow(data.show);
        setBookedSeats(data.show.bookedSeats || []);
        setHeldSeats((data.activeHeldSeats || []).map((h) => h.seatNumber));
        if (data.screenConfig) {
          setScreenConfig(data.screenConfig);
        }
      } catch (err) {
        console.error('Error fetching show seat map:', err);
        setErrorMessage('Failed to load show seat layout.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowDetails();
  }, [showId]);

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId) || heldSeats.includes(seatId)) {
      return; // Not selectable
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      // Limit to 8 seats per booking
      if (selectedSeats.length >= 8) {
        toast.warning('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to complete your ticket booking.');
      navigate('/login', { state: { from: { pathname: `/booking/seats/${showId}` } } });
      return;
    }

    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await bookingService.createBooking(showId, selectedSeats);
      toast.success('Seats held! Proceeding to simulated checkout.');
      navigate(`/checkout/${result.booking._id}`);
    } catch (err) {
      const message = err.response?.data?.message || 'Could not reserve seats. Please try selecting different seats.';
      setErrorMessage(message);
      toast.error(message);
      // Refresh seat data
      const data = await showService.getShowById(showId);
      setBookedSeats(data.show.bookedSeats || []);
      setHeldSeats((data.activeHeldSeats || []).map((h) => h.seatNumber));
      // Remove any newly unavailable seats from user's selection
      setSelectedSeats(selectedSeats.filter((s) => !data.show.bookedSeats.includes(s)));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading auditorium layout...</span>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-white">Show Not Found</h4>
        <Link to="/movies" className="btn im-btn-primary mt-3">Browse Movies</Link>
      </div>
    );
  }

  const ticketPrice = show.ticketPrice || 15.0;
  const totalPrice = selectedSeats.length * ticketPrice;

  return (
    <div className="container py-5">
      {/* Header Info */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <span className="badge bg-danger mb-2">SEAT SELECTION</span>
          <h2 className="fw-bold text-white mb-1">{show.movie?.title}</h2>
          <div className="text-secondary small d-flex flex-wrap gap-2">
            <span><i className="bi bi-geo-alt me-1"></i>{show.theatre?.name} ({show.screenName})</span>
            <span>&bull;</span>
            <span><i className="bi bi-calendar3 me-1"></i>{show.showDate}</span>
            <span>&bull;</span>
            <span><i className="bi bi-clock me-1"></i>{show.startTime}</span>
          </div>
        </div>

        <div className="text-md-end">
          <div className="small text-secondary">Price per seat</div>
          <div className="fs-4 fw-bold text-danger">${ticketPrice.toFixed(2)}</div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Auditorium Screen Visual */}
      <div className="im-card p-4 p-md-5 mb-4 text-center">
        <div className="mx-auto mb-4" style={{ maxWidth: '650px' }}>
          <div className="cinema-screen-demo mb-2"></div>
          <span className="text-secondary small tracking-wider">ALL EYES ON SCREEN</span>
        </div>

        {/* Seat Layout Grid */}
        <div className="d-inline-block p-2 p-md-4 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          {screenConfig.rows.map((rowLetter) => (
            <div key={rowLetter} className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <span className="fw-bold text-secondary me-2" style={{ width: '20px' }}>
                {rowLetter}
              </span>

              {Array.from({ length: screenConfig.seatsPerRow }, (_, i) => i + 1).map((seatNum) => {
                const seatId = `${rowLetter}${seatNum}`;
                const isBooked = bookedSeats.includes(seatId);
                const isHeld = heldSeats.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);

                let seatClass = 'btn-outline-secondary text-light';
                let title = `Seat ${seatId} - Available`;

                if (isBooked) {
                  seatClass = 'btn-secondary disabled opacity-25';
                  title = `Seat ${seatId} - Booked`;
                } else if (isHeld) {
                  seatClass = 'btn-warning disabled opacity-50';
                  title = `Seat ${seatId} - Reserved by customer`;
                } else if (isSelected) {
                  seatClass = 'btn-danger shadow';
                  title = `Seat ${seatId} - Selected`;
                }

                return (
                  <button
                    key={seatId}
                    type="button"
                    className={`btn btn-sm ${seatClass} d-flex align-items-center justify-content-center p-0 rounded-2`}
                    style={{
                      width: '32px',
                      height: '32px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                    onClick={() => handleSeatClick(seatId)}
                    disabled={isBooked || isHeld}
                    title={title}
                  >
                    {seatNum}
                  </button>
                );
              })}

              <span className="fw-bold text-secondary ms-2" style={{ width: '20px' }}>
                {rowLetter}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="d-flex justify-content-center align-items-center flex-wrap gap-4 mt-5 pt-3 border-top border-secondary border-opacity-10">
          <div className="d-flex align-items-center gap-2 small">
            <span className="rounded-2 border border-secondary" style={{ width: '20px', height: '20px', display: 'inline-block' }}></span>
            <span className="text-secondary">Available</span>
          </div>
          <div className="d-flex align-items-center gap-2 small">
            <span className="rounded-2 bg-danger" style={{ width: '20px', height: '20px', display: 'inline-block' }}></span>
            <span className="text-white">Selected</span>
          </div>
          <div className="d-flex align-items-center gap-2 small">
            <span className="rounded-2 bg-secondary opacity-25" style={{ width: '20px', height: '20px', display: 'inline-block' }}></span>
            <span className="text-secondary">Booked</span>
          </div>
          <div className="d-flex align-items-center gap-2 small">
            <span className="rounded-2 bg-warning opacity-50" style={{ width: '20px', height: '20px', display: 'inline-block' }}></span>
            <span className="text-secondary">Reserved (Hold)</span>
          </div>
        </div>
      </div>

      {/* Checkout Summary Bar */}
      <div className="im-card p-4">
        <div className="row align-items-center g-3">
          <div className="col-md-7">
            <div className="small text-secondary mb-1">Your Selected Seats:</div>
            <div className="d-flex flex-wrap gap-2">
              {selectedSeats.length === 0 ? (
                <span className="text-muted small">No seats selected yet. Click any available seat above.</span>
              ) : (
                selectedSeats.map((s) => (
                  <span key={s} className="badge bg-danger px-3 py-2 fs-6">
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="col-md-5 d-flex justify-content-md-end align-items-center gap-4">
            <div className="text-md-end">
              <span className="small text-secondary d-block">Total Amount</span>
              <span className="fs-3 fw-bold text-white">${totalPrice.toFixed(2)}</span>
            </div>

            <button
              className="btn im-btn-primary px-4 py-3 d-flex align-items-center gap-2"
              onClick={handleProceedToCheckout}
              disabled={selectedSeats.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Locking Seats...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-lock-fill"></i>
                  <span>Checkout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
