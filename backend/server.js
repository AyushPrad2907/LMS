const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const enrollmentRoutes = require('./routes/enrollments');
const courseRoutes = require('./routes/courses');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const Course = require('./models/Course');
const Admin = require('./models/Admin');

const app = express();

app.use(cors());
// Raised limit so base64-encoded passport photo + payment screenshot uploads fit in the request body
app.use(express.json({ limit: '12mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

app.all('/api/{*any}', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error('MONGO_URI is missing in .env');
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

const defaultCourses = [
  { courseId: 'math-5', name: '5th Fundamental', track: 'Hindi Medium', level: 'School', fee: 1000 },
  { courseId: 'math-6', name: '6th Fundamental', track: 'Hindi Medium', level: 'School', fee: 1500 },
  { courseId: 'math-11', name: 'Class 11 Science', track: 'English Medium', level: 'Higher Secondary', fee: 6000 },
  { courseId: 'neet', name: 'NEET Preparation', track: 'Bilingual', level: 'Competitive', fee: 25000 },
  { courseId: 'upsc', name: 'UPSC Mains', track: 'English Medium', level: 'Competitive', fee: 30000 },
  { courseId: 'spoken', name: 'English Spoken', track: 'English Medium', level: 'Professional', fee: 3000 },
];

async function seedDefaultCourses() {
  await Promise.all(
    defaultCourses.map((course) =>
      Course.updateOne({ courseId: course.courseId }, { $setOnInsert: course }, { upsert: true })
    )
  );
}

// Creates a single admin account from ADMIN_EMAIL / ADMIN_PASSWORD in .env, if one doesn't already exist.
// There is no public admin registration endpoint — this is the only way an admin account gets created,
// and the password is hashed automatically by the Admin model's pre-save hook.
async function seedDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set in .env — skipping default admin seed.');
    return;
  }

  const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!existing) {
    await Admin.create({ name: 'Administrator', email, password });
    console.log(`Default admin account created for ${email}`);
  }
}

async function connectToMongoWithRetry(maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(MONGO_URI, mongoOptions);
      console.log('Connected to MongoDB Atlas');
      return;
    } catch (err) {
      const waitMs = attempt * 2000;
      console.error(`MongoDB connection failed (attempt ${attempt}/${maxRetries}):`, err.message);

      if (attempt === maxRetries) {
        throw err;
      }

      console.log(`Retrying MongoDB connection in ${waitMs / 1000}s...`);
      await sleep(waitMs);
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Waiting for automatic reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

connectToMongoWithRetry()
  .then(() => Promise.all([seedDefaultCourses(), seedDefaultAdmin()]))
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
  console.error("❌ STARTUP ERROR:");
  console.error(err);
  process.exit(1);
});