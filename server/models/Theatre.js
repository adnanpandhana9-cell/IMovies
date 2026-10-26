import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Screen name is required'],
    trim: true,
  },
  seatCapacity: {
    type: Number,
    required: [true, 'Seat capacity is required'],
    min: [10, 'Minimum capacity is 10 seats'],
    max: [300, 'Maximum capacity is 300 seats'],
    default: 60,
  },
  rows: {
    type: [String],
    default: ['A', 'B', 'C', 'D', 'E', 'F'],
  },
  seatsPerRow: {
    type: Number,
    default: 10,
    min: [4, 'Minimum 4 seats per row'],
    max: [20, 'Maximum 20 seats per row'],
  },
});

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Theatre address is required'],
      trim: true,
    },
    screens: {
      type: [screenSchema],
      default: [
        {
          name: 'Screen 1',
          seatCapacity: 60,
          rows: ['A', 'B', 'C', 'D', 'E', 'F'],
          seatsPerRow: 10,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Theatre = mongoose.model('Theatre', theatreSchema);

export default Theatre;
