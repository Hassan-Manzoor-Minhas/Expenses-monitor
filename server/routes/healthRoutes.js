import express from 'express';
import { dbState, connectDB } from '../config/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbState.connected,
      mode: dbState.mode,
      uri: dbState.uri,
      error: dbState.error,
      lastChecked: dbState.lastChecked,
    },
    message: dbState.connected
      ? 'MongoDB is connected and operational.'
      : 'MongoDB is currently offline. Operating in fallback memory mode.',
  });
});

router.post('/reconnect', async (req, res) => {
  await connectDB();
  res.status(200).json({
    success: true,
    database: {
      connected: dbState.connected,
      mode: dbState.mode,
      uri: dbState.uri,
      error: dbState.error,
      lastChecked: dbState.lastChecked,
    },
    message: dbState.connected
      ? 'Successfully connected to MongoDB!'
      : 'MongoDB is still offline. Please verify that mongod service is started.',
  });
});

export default router;
