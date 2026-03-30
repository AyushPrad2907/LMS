const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);

// Fallback: serve login page for unknown routes (Express 5 wildcard syntax)
app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing in .env');
  process.exit(1);
}

const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 20,
  minPoolSize: 2,
  maxIdleTimeMS: 300000,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectToMongoWithRetry(maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(MONGO_URI, mongoOptions);
      console.log('✅ Connected to MongoDB Atlas');
      return;
    } catch (err) {
      const waitMs = attempt * 2000;
      console.error(`❌ MongoDB connection failed (attempt ${attempt}/${maxRetries}):`, err.message);

      if (attempt === maxRetries) {
        throw err;
      }

      console.log(`⏳ Retrying MongoDB connection in ${waitMs / 1000}s...`);
      await sleep(waitMs);
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Waiting for automatic reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err.message);
});

connectToMongoWithRetry()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(() => {
    process.exit(1);
  });