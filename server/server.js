import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  // Attempt database connection
  const dbConnected = await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 IMovies Server listening on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
    if (dbConnected) {
      console.log(`✅ Database Status: Connected to MongoDB Atlas`);
    } else {
      console.log(`⚠️  Database Status: Disconnected — Operating in Health-Diagnostic Mode`);
    }
    console.log(`🩺 Health check endpoint: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n${signal} signal received: closing HTTP server...`);
    server.close(async () => {
      console.log('HTTP server closed');
      await closeDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
