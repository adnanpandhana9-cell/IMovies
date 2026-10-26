import test from 'node:test';
import assert from 'node:assert/strict';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import paymentService from '../services/paymentService.js';
import { createBooking, cancelBooking } from '../controllers/bookingController.js';
import { processPayment } from '../controllers/paymentController.js';

test('Booking model requires user, show, seats and validates status', () => {
  const booking = new Booking({
    bookingReference: 'IMV-TEST01',
    user: '671ba75c94c9a62ef0000001',
    show: '671ba75c94c9a62ef0000002',
    movieSnapshot: {
      title: 'Inception',
      posterUrl: 'https://example.com/poster.jpg',
      duration: 148,
      language: 'English',
    },
    theatreSnapshot: {
      name: 'Grand Cinema',
      city: 'Downtown',
      address: '100 Main St',
      screenName: 'Screen 1',
    },
    showDetails: {
      showDate: '2026-10-27',
      startTime: '18:00',
    },
    seats: ['A1', 'A2'],
    ticketPrice: 15.0,
    totalAmount: 30.0,
  });

  const err = booking.validateSync();
  assert.equal(err, undefined);
  assert.equal(booking.bookingStatus, 'PENDING_PAYMENT');
  assert.equal(booking.totalAmount, 30.0);
});

test('createBooking rejects unavailable seats when atomic conditional update fails', async () => {
  const originalShowFind = Show.findById;
  const originalUpdateOne = Show.updateOne;
  const originalFindOneAndUpdate = Show.findOneAndUpdate;

  Show.findById = () => ({
    populate: () => ({
      populate: async () => ({
        _id: 'show123',
        status: 'OPEN',
        ticketPrice: 15.0,
        movie: { title: 'Movie 1', posterUrl: 'url', duration: 120, language: 'English' },
        theatre: { name: 'Theatre 1', city: 'City', address: 'Addr', screenName: 'Screen 1' },
      }),
    }),
  });
  Show.updateOne = async () => ({});
  // Simulate atomic update failing because seat is already booked/held
  Show.findOneAndUpdate = async () => null;

  const req = {
    user: { _id: '671ba75c94c9a62ef0000001' },
    body: {
      showId: 'show123',
      selectedSeats: ['A1', 'A2'],
    },
  };

  let responseStatus = null;
  let responseData = null;

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  try {
    await createBooking(req, res, () => {});
    assert.equal(responseStatus, 409); // Conflict
    assert.equal(responseData.success, false);
    assert.ok(responseData.message.includes('unavailable or were just reserved'));
  } finally {
    Show.findById = originalShowFind;
    Show.updateOne = originalUpdateOne;
    Show.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test('paymentService simulates transaction approval and decline cleanly', async () => {
  const approved = await paymentService.processTransaction({
    bookingReference: 'IMV-TEST99',
    amount: 30.0,
    paymentMethod: 'UPI',
    simulateSuccess: true,
  });

  assert.equal(approved.success, true);
  assert.equal(approved.status, 'PAID');
  assert.ok(approved.transactionId.startsWith('TXN-'));

  const declined = await paymentService.processTransaction({
    bookingReference: 'IMV-TEST99',
    amount: 30.0,
    paymentMethod: 'CARD',
    simulateSuccess: false,
  });

  assert.equal(declined.success, false);
  assert.equal(declined.status, 'FAILED');
  assert.equal(declined.transactionId, null);
});

test('cancelBooking marks status as CANCELLED and triggers seat release', async () => {
  const originalBookingFind = Booking.findById;
  const originalShowUpdateOne = Show.updateOne;

  let showUpdated = false;
  Show.updateOne = async () => {
    showUpdated = true;
    return {};
  };

  const mockBooking = {
    _id: 'booking123',
    user: '671ba75c94c9a62ef0000001',
    show: 'show123',
    seats: ['A1', 'A2'],
    bookingStatus: 'CONFIRMED',
    save: async function () {
      return this;
    },
  };

  Booking.findById = async () => mockBooking;

  const req = {
    user: { _id: '671ba75c94c9a62ef0000001', role: 'USER' },
    params: { id: 'booking123' },
    body: { reason: 'Schedule changed' },
  };

  let responseStatus = null;
  let responseData = null;

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  try {
    await cancelBooking(req, res, () => {});
    assert.equal(responseStatus, 200);
    assert.equal(responseData.success, true);
    assert.equal(mockBooking.bookingStatus, 'CANCELLED');
    assert.equal(showUpdated, true);
  } finally {
    Booking.findById = originalBookingFind;
    Show.updateOne = originalShowUpdateOne;
  }
});
