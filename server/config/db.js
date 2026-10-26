import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from cwd and from server directory reliably
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Maps Mongoose connection ready states to readable status strings
 */
const readyStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Helper to categorize MongoDB Atlas connection errors into understandable categories
 * without leaking sensitive credentials or passwords.
 */
export const categorizeConnectionError = (error) => {
  const message = error?.message || '';

  if (message.includes('AuthenticationFailed') || message.includes('auth failed') || message.includes('bad auth')) {
    return {
      category: 'Incorrect credentials',
      suggestion: 'Verify the database username and password in server/.env (special characters in password must be URL-encoded).',
    };
  }

  if (message.includes('querySrv ENOTFOUND') || message.includes('getaddrinfo ENOTFOUND')) {
    return {
      category: 'DNS or network failure',
      suggestion: 'Check your internet connection and verify the cluster hostname in your MONGODB_URI.',
    };
  }

  if (message.includes('Server selection timed out') || message.includes('ETIMEDOUT')) {
    return {
      category: 'Network access restriction / Timeout',
      suggestion: 'Ensure your current IP address is added to the MongoDB Atlas Network Access IP Access List (or 0.0.0.0/0 during development).',
    };
  }

  return {
    category: 'Database connection failure',
    suggestion: 'Verify your cluster is active and MONGODB_URI is correctly formatted.',
  };
};

/**
 * Returns safe status information about the MongoDB connection.
 * Never includes credentials, tokens, or connection strings.
 */
export const getDatabaseStatus = () => {
  const stateCode = mongoose.connection.readyState;
  return {
    connected: stateCode === 1,
    state: readyStates[stateCode] || 'unknown',
    host: stateCode === 1 ? mongoose.connection.host : null,
    name: stateCode === 1 ? mongoose.connection.name : null,
  };
};

/**
 * Connects to MongoDB Atlas using process.env.MONGODB_URI.
 * Safe handling:
 * - Reads process.env.MONGODB_URI loaded via dotenv.
 * - Detects missing connection strings or placeholder values.
 * - Prevents redundant/duplicate initialization if already connected or connecting.
 * - Categorizes and logs connection errors safely without printing credentials.
 * - Sets up connection lifecycle event listeners.
 */
export const connectDB = async () => {
  // Prevent duplicate connection attempts
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB is already connected.');
    return true;
  }
  if (mongoose.connection.readyState === 2) {
    console.log('MongoDB connection is already in progress...');
    return false;
  }

  const uri = process.env.MONGODB_URI;

  // Check for missing URI or placeholder patterns
  if (
    !uri ||
    uri.trim() === '' ||
    uri.includes('PASTE_YOUR') ||
    uri.includes('<username>') ||
    uri.includes('<password>') ||
    uri.includes('<cluster-host>') ||
    uri.includes('<cluster-url>')
  ) {
    console.warn('\n================================================================');
    console.warn('⚠️  MONGODB_URI is not configured in server/.env');
    console.warn('   Category: Missing connection string');
    console.warn('   Action: Open server/.env and provide your MongoDB Atlas URI.');
    console.warn('   Format: mongodb+srv://<username>:<password>@<cluster-host>/imovies');
    console.warn('   The server will run in health-diagnostic mode until configured.');
    console.warn('================================================================\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Safe 5s timeout to prevent hanging on network blocks
    });

    console.log(`✅ MongoDB Connected: Host=${conn.connection.host}, DB=${conn.connection.name}`);
    return true;
  } catch (error) {
    const diagnostics = categorizeConnectionError(error);
    console.error(`\n❌ MongoDB Connection Error [${diagnostics.category}]:`);
    console.error(`   Message: ${error.message.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@')}`);
    console.error(`   Suggestion: ${diagnostics.suggestion}\n`);
    return false;
  }
};

// Connection event listeners
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB connection disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB connection reconnected');
});

/**
 * Gracefully closes the database connection during process shutdown
 */
export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed gracefully');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err.message);
    }
  }
};
