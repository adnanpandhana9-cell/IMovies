import express from 'express';
import { getDatabaseStatus } from '../config/db.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    System health check distinguishing API process & database connection status
 * @access  Public
 */
router.get('/health', (req, res) => {
  const dbStatus = getDatabaseStatus();

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    api: {
      status: 'healthy',
      version: '1.0.0',
    },
    database: {
      connected: dbStatus.connected,
      state: dbStatus.state,
      // Only show cluster host/database name if connected, never passwords or URIs
      ...(dbStatus.connected && {
        host: dbStatus.host,
        name: dbStatus.name,
      }),
      message: dbStatus.connected
        ? 'MongoDB Atlas is connected and operational'
        : 'MongoDB is disconnected. Please check MONGODB_URI in server/.env',
    },
  };

  // If database is disconnected, return 503 Service Unavailable or 200 with clear flags
  // Returning 200 with database.connected: false allows the frontend and monitors to read the diagnostic status
  res.status(dbStatus.connected ? 200 : 503).json(healthData);
});

export default router;
