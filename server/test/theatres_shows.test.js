import test from 'node:test';
import assert from 'node:assert/strict';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import { createShow } from '../controllers/showController.js';

test('Theatre model validates required city, address and default screens', () => {
  const theatre = new Theatre({
    name: 'Metropolis Cinema',
    city: 'Gotham',
    address: '42 Wayne Plaza',
  });

  const err = theatre.validateSync();
  assert.equal(err, undefined);
  assert.equal(theatre.screens.length, 1);
  assert.equal(theatre.screens[0].name, 'Screen 1');
  assert.equal(theatre.screens[0].seatCapacity, 60);
});

test('Show model validates time formatting and pricing', () => {
  const show = new Show({
    movie: '671ba75c94c9a62ef0000001',
    theatre: '671ba75c94c9a62ef0000002',
    screenName: 'Screen 1',
    showDate: '2026-10-27',
    startTime: '18:00',
    endTime: '20:30',
    ticketPrice: 15.5,
  });

  const err = show.validateSync();
  assert.equal(err, undefined);
  assert.equal(show.status, 'OPEN');
});

test('createShow rejects overlapping schedules on the same theatre screen', async () => {
  const originalMovieFind = Movie.findById;
  const originalTheatreFind = Theatre.findById;
  const originalShowFind = Show.find;

  Movie.findById = async () => ({ _id: '671ba75c94c9a62ef0000001', title: 'Movie 1' });
  Theatre.findById = async () => ({
    _id: '671ba75c94c9a62ef0000002',
    name: 'Theatre 1',
    screens: [{ name: 'Screen 1', seatCapacity: 60 }],
  });
  // Simulate an existing show from 18:00 to 20:30
  Show.find = async () => [
    {
      _id: 'existing1',
      screenName: 'Screen 1',
      showDate: '2026-10-27',
      startTime: '18:00',
      endTime: '20:30',
    },
  ];

  const req = {
    body: {
      movie: '671ba75c94c9a62ef0000001',
      theatre: '671ba75c94c9a62ef0000002',
      screenName: 'Screen 1',
      showDate: '2026-10-27',
      startTime: '19:00', // Overlaps with 18:00 - 20:30
      endTime: '21:30',
      ticketPrice: 15.0,
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
    await createShow(req, res, () => {});
    assert.equal(responseStatus, 400);
    assert.equal(responseData.success, false);
    assert.ok(responseData.message.includes('Scheduling conflict'));
  } finally {
    Movie.findById = originalMovieFind;
    Theatre.findById = originalTheatreFind;
    Show.find = originalShowFind;
  }
});
