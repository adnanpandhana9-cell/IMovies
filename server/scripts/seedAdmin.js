import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { connectDB, closeDB } from '../config/db.js';

dotenv.config();

/**
 * Bootstrap script to initialize an Administrator account safely.
 * Usage:
 *   ADMIN_EMAIL=admin@imovies.com ADMIN_PASSWORD=StrongAdminPass123! npm run seed:admin
 * Or define ADMIN_EMAIL and ADMIN_PASSWORD in server/.env
 */
const seedAdmin = async () => {
  console.log('\n============================================================');
  console.log('🛡️  IMovies Administrator Bootstrap Script');
  console.log('============================================================\n');

  const adminName = process.env.ADMIN_NAME || 'IMovies Administrator';
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('❌ Error: Missing required administrator credentials.');
    console.error('   Please define ADMIN_EMAIL and ADMIN_PASSWORD in server/.env');
    console.error('   or pass them inline when executing the seed script:');
    console.error('   ADMIN_EMAIL=admin@imovies.com ADMIN_PASSWORD=YourPassword npm run seed:admin\n');
    process.exit(1);
  }

  if (adminPassword.length < 6) {
    console.error('❌ Error: Administrator password must be at least 6 characters long.\n');
    process.exit(1);
  }

  // Connect to MongoDB
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Error: Could not connect to MongoDB Atlas. Check MONGODB_URI in server/.env.\n');
    process.exit(1);
  }

  try {
    const existingUser = await User.findOne({ email: adminEmail.toLowerCase().trim() });

    if (existingUser) {
      if (existingUser.role === 'ADMIN') {
        console.log(`ℹ️  Administrator account already exists for ${adminEmail}. No modifications made.`);
      } else {
        existingUser.role = 'ADMIN';
        await existingUser.save();
        console.log(`✅ Existing account for ${adminEmail} has been elevated to ADMIN role.`);
      }
    } else {
      const newAdmin = new User({
        name: adminName,
        email: adminEmail.toLowerCase().trim(),
        password: adminPassword,
        role: 'ADMIN',
      });

      await newAdmin.save();
      console.log(`✅ Successfully bootstrapped administrator account: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Error seeding administrator:', error.message);
  } finally {
    await closeDB();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedAdmin();
