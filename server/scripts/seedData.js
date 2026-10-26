import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sampleMovies = [
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    language: 'English',
    duration: 148,
    releaseDate: new Date('2010-07-16'),
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    rating: 8.8,
    status: 'NOW_SHOWING',
  },
  {
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    language: 'English',
    duration: 169,
    releaseDate: new Date('2014-11-07'),
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    rating: 8.7,
    status: 'NOW_SHOWING',
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: ['Biography', 'Drama', 'History'],
    language: 'English',
    duration: 180,
    releaseDate: new Date('2023-07-21'),
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    rating: 8.9,
    status: 'NOW_SHOWING',
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genre: ['Action', 'Crime', 'Drama'],
    language: 'English',
    duration: 152,
    releaseDate: new Date('2008-07-18'),
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    rating: 9.0,
    status: 'NOW_SHOWING',
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    language: 'English',
    duration: 166,
    releaseDate: new Date('2024-03-01'),
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    rating: 8.6,
    status: 'NOW_SHOWING',
  },
  {
    title: 'Gladiator II',
    description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered.',
    genre: ['Action', 'Adventure', 'Drama'],
    language: 'English',
    duration: 148,
    releaseDate: new Date('2024-11-22'),
    posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
    trailerUrl: '',
    rating: 8.2,
    status: 'COMING_SOON',
  },
];

const sampleTheatres = [
  {
    name: 'IMovies Grand Cinema',
    city: 'Downtown',
    address: '100 Cinema Blvd, Arts District',
    screens: [
      {
        name: 'Screen 1',
        seatCapacity: 60,
        rows: ['A', 'B', 'C', 'D', 'E', 'F'],
        seatsPerRow: 10,
      },
      {
        name: 'IMAX Laser Screen',
        seatCapacity: 80,
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        seatsPerRow: 10,
      },
    ],
  },
  {
    name: 'CineStar Multiplex',
    city: 'Uptown',
    address: '450 North Galleria Mall',
    screens: [
      {
        name: 'Dolby Atmos Screen',
        seatCapacity: 60,
        rows: ['A', 'B', 'C', 'D', 'E', 'F'],
        seatsPerRow: 10,
      },
    ],
  },
];

const seedData = async () => {
  console.log('\n============================================================');
  console.log('🎬 Seeding IMovies Sample Cinema Data to MongoDB Atlas');
  console.log('============================================================\n');

  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Could not connect to MongoDB Atlas. Check server/.env.');
    process.exit(1);
  }

  try {
    // 1. Seed Movies if none exist
    const existingMovieCount = await Movie.countDocuments();
    let seededMovies = [];
    if (existingMovieCount === 0) {
      seededMovies = await Movie.insertMany(sampleMovies);
      console.log(`✅ Seeded ${seededMovies.length} movies.`);
    } else {
      seededMovies = await Movie.find().limit(6);
      console.log(`ℹ️  Movies already present in database (${existingMovieCount} movies).`);
    }

    // 2. Seed Theatres if none exist
    const existingTheatreCount = await Theatre.countDocuments();
    let seededTheatres = [];
    if (existingTheatreCount === 0) {
      seededTheatres = await Theatre.insertMany(sampleTheatres);
      console.log(`✅ Seeded ${seededTheatres.length} theatres.`);
    } else {
      seededTheatres = await Theatre.find().limit(2);
      console.log(`ℹ️  Theatres already present in database (${existingTheatreCount} theatres).`);
    }

    // 3. Seed Shows if none exist
    const existingShowCount = await Show.countDocuments();
    if (existingShowCount === 0 && seededMovies.length > 0 && seededTheatres.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

      const sampleShows = [
        // Today
        {
          movie: seededMovies[0]._id,
          theatre: seededTheatres[0]._id,
          screenName: 'Screen 1',
          showDate: today,
          startTime: '14:00',
          endTime: '16:30',
          ticketPrice: 14.5,
          totalSeats: 60,
          availableSeatsCount: 60,
          bookedSeats: [],
          heldSeats: [],
          status: 'OPEN',
        },
        {
          movie: seededMovies[0]._id,
          theatre: seededTheatres[0]._id,
          screenName: 'Screen 1',
          showDate: today,
          startTime: '18:00',
          endTime: '20:30',
          ticketPrice: 16.0,
          totalSeats: 60,
          availableSeatsCount: 60,
          bookedSeats: [],
          heldSeats: [],
          status: 'OPEN',
        },
        {
          movie: seededMovies[1]._id,
          theatre: seededTheatres[0]._id,
          screenName: 'IMAX Laser Screen',
          showDate: today,
          startTime: '19:30',
          endTime: '22:30',
          ticketPrice: 18.5,
          totalSeats: 80,
          availableSeatsCount: 80,
          bookedSeats: [],
          heldSeats: [],
          status: 'OPEN',
        },
        // Tomorrow
        {
          movie: seededMovies[2]._id,
          theatre: seededTheatres[1]._id,
          screenName: 'Dolby Atmos Screen',
          showDate: tomorrow,
          startTime: '15:30',
          endTime: '18:30',
          ticketPrice: 15.0,
          totalSeats: 60,
          availableSeatsCount: 60,
          bookedSeats: [],
          heldSeats: [],
          status: 'OPEN',
        },
        {
          movie: seededMovies[3]._id,
          theatre: seededTheatres[1]._id,
          screenName: 'Dolby Atmos Screen',
          showDate: tomorrow,
          startTime: '20:00',
          endTime: '22:45',
          ticketPrice: 16.5,
          totalSeats: 60,
          availableSeatsCount: 60,
          bookedSeats: [],
          heldSeats: [],
          status: 'OPEN',
        },
        // Day after
        {
          movie: seededMovies[0]._id,
          theatre: seededTheatres[0]._id,
          screenName: 'Screen 1',
          showDate: dayAfter,
          startTime: '17:00',
          endTime: '19:30',
          ticketPrice: 14.5,
          totalSeats: 60,
          availableSeatsCount: 60,
          bookedSeats: [],
          heldSeats: [],
          status: 'OPEN',
        },
      ];

      await Show.insertMany(sampleShows);
      console.log(`✅ Seeded ${sampleShows.length} upcoming shows.`);
    } else {
      console.log(`ℹ️  Shows already present in database (${existingShowCount} shows).`);
    }

    console.log('\n🎉 Database seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  } finally {
    await closeDB();
    process.exit(0);
  }
};

seedData();
