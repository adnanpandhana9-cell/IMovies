import mongoose from 'mongoose';

const heldSeatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
    },
    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index to auto-expire held seats
    },
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true,
    },
    screenName: {
      type: String,
      required: [true, 'Screen name is required'],
      default: 'Screen 1',
    },
    showDate: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Show date is required (YYYY-MM-DD)'],
      index: true,
    },
    startTime: {
      type: String, // 'HH:MM'
      required: [true, 'Start time is required (HH:MM)'],
    },
    endTime: {
      type: String, // 'HH:MM'
      required: [true, 'End time is required (HH:MM)'],
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Ticket price cannot be negative'],
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 60,
    },
    availableSeatsCount: {
      type: Number,
      required: true,
      default: 60,
    },
    bookedSeats: {
      type: [String],
      default: [],
    },
    heldSeats: {
      type: [heldSeatSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['OPEN', 'SOLD_OUT', 'CANCELLED'],
        message: 'Status must be OPEN, SOLD_OUT, or CANCELLED',
      },
      default: 'OPEN',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick query filtering
showSchema.index({ movie: 1, showDate: 1, status: 1 });
showSchema.index({ theatre: 1, screenName: 1, showDate: 1 });

const Show = mongoose.model('Show', showSchema);

export default Show;
