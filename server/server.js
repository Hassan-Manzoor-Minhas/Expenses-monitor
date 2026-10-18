import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { initMemoryStore } from './services/dataStore.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security response headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS Middleware - allow dynamic reflection of origin so credentials: true never fails
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or any localhost origin
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Welcome / Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Expense Tracker REST API',
    status: 'online',
    version: '1.0.0',
    documentation: {
      health: '/api/health',
      auth: '/api/auth',
      transactions: '/api/transactions',
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server and initialize database
const startServer = async () => {
  try {
    // Attempt DB connection (will catch error if MongoDB is not running)
    await connectDB();

    // Initialize memory store with demo data if in offline memory mode
    await initMemoryStore();

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server listening on http://localhost:${PORT}`);
      console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth API available at: http://localhost:${PORT}/api/auth`);
      console.log(`💳 Transactions API available at: http://localhost:${PORT}/api/transactions\n`);
    });

    const shutdown = () => {
      console.log('\nGracefully shutting down server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
