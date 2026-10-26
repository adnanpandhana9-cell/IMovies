import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required'],
      index: true,
    },
    movieSnapshot: {
      title: { type: String, required: true },
      posterUrl: { type: String, required: true },
      duration: { type: Number, required: true },
      language: { type: String, required: true },
      genre: { type: [String], default: [] },
    },
    theatreSnapshot: {
      name: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      screenName: { type: String, required: true },
    },
    showDetails: {
      showDate: { type: String, required: true },
      startTime: { type: String, required: true },
    },
    seats: {
      type: [String],
      required: [true, 'At least one seat must be selected'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Must select at least one seat',
      },
    },
    ticketPrice: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: {
        values: ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
        message: 'Invalid booking status',
      },
      default: 'PENDING_PAYMENT',
      index: true,
    },
    paymentDetails: {
      transactionId: { type: String, default: null },
      paymentMethod: { type: String, default: null },
      paidAt: { type: Date, default: null },
      status: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
        default: 'PENDING',
      },
    },
    cancellationDetails: {
      isCancelled: { type: Boolean, default: false },
      cancelledAt: { type: Date, default: null },
      reason: { type: String, default: null },
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes hold
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user bookings retrieval sorted by date
bookingSchema.index({ user: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
