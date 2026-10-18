import mongoose from 'mongoose';

export const dbState = {
  connected: false,
  mode: 'disconnected',
  uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense-tracker',
  error: null,
  lastChecked: null,
};

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense-tracker';
  dbState.uri = uri;
  dbState.lastChecked = new Date().toISOString();

  console.log(`\n======================================================`);
  console.log(`🔌 Attempting MongoDB connection to: ${uri}`);
  console.log(`======================================================`);

  try {
    // 3 second timeout for initial connection attempt so server startup is fast
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });

    dbState.connected = true;
    dbState.mode = 'mongodb';
    dbState.error = null;
    console.log(`✅ [MONGODB CONNECTED]: Successfully connected to MongoDB database.`);
  } catch (error) {
    dbState.connected = false;
    dbState.mode = 'memory';
    dbState.error = error.message;

    console.warn(`\n⚠️  ****************************************************************`);
    console.warn(`⚠️  [MONGODB IS NOT RUNNING]:`);
    console.warn(`⚠️  Unable to connect to MongoDB at ${uri}.`);
    console.warn(`⚠️  Reason: ${error.message}`);
    console.warn(`⚠️  ----------------------------------------------------------------`);
    console.warn(`⚠️  HOW TO FIX:`);
    console.warn(`⚠️  1. If MongoDB is installed locally: run 'mongod' or 'net start MongoDB'`);
    console.warn(`⚠️  2. Or if using MongoDB Atlas: update MONGO_URI in 'server/.env'`);
    console.warn(`⚠️  ----------------------------------------------------------------`);
    console.warn(`⚠️  FALLBACK ACTIVE: The server is operating with an in-memory data store`);
    console.warn(`⚠️  so all auth, transaction, and chart features remain 100% functional!`);
    console.warn(`⚠️  ****************************************************************\n`);
  }
};

mongoose.connection.on('disconnected', () => {
  if (dbState.connected) {
    dbState.connected = false;
    dbState.mode = 'memory';
    console.warn('⚠️ MongoDB disconnected. Switching to fallback store.');
  }
});
