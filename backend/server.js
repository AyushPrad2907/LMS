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
const trialRoutes = require('./routes/trial'); // NEW

const Course = require('./models/Course');
const Admin = require('./models/Admin');

const app = express();

app.use(cors());

// Raised limit so base64-encoded passport photo + payment screenshot uploads fit in the request body
app.use(express.json({ limit: '12mb' }));

app.use(express.static(path.join(__dirname, '../frontend'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
}));

// ================= Routes =================

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/trial', trialRoutes); 

// ==========================================

app.all('/api/{*any}', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found.',
  });
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
  // SCHOOL 5-8 Hindi
  { courseId: 's01', level: 'school', name: '5th Fundamental', track: 'Hindi', fee: 500 },
  { courseId: 's02', level: 'school', name: '5th Advance', track: 'Hindi', fee: 750 },
  { courseId: 's03', level: 'school', name: '5th Fundamental', track: 'English', fee: 600 },
  { courseId: 's04', level: 'school', name: '5th Advance', track: 'English', fee: 800 },
  { courseId: 's05', level: 'school', name: '6th Fundamental', track: 'Hindi', fee: 750 },
  { courseId: 's06', level: 'school', name: '6th Fundamental', track: 'English', fee: 750 },
  { courseId: 's07', level: 'school', name: '7th Advance', track: 'Hindi', fee: 900 },
  { courseId: 's08', level: 'school', name: '7th Advance', track: 'English', fee: 900 },
  { courseId: 's09', level: 'school', name: '8th Advance', track: 'Hindi', fee: 800 },
  { courseId: 's10', level: 'school', name: '8th Advance', track: 'English', fee: 1000 },
  // SCHOOL 9-10
  { courseId: 's11', level: 'school', name: '9th Advance', track: 'Hindi', fee: 800 },
  { courseId: 's12', level: 'school', name: '9th Advance', track: 'English', fee: 1000 },
  { courseId: 's13', level: 'school', name: '10th Advance', track: 'Hindi', fee: 900 },
  { courseId: 's14', level: 'school', name: '10th Advance', track: 'English', fee: 1100 },
  // CLASS 11
  { courseId: 'h01', level: 'higher', name: '11th PCM', track: 'English', fee: 2000 },
  { courseId: 'h02', level: 'higher', name: '11th PCM', track: 'Hindi', fee: 1750 },
  { courseId: 'h03', level: 'higher', name: '11th PCB', track: 'English', fee: 1800 },
  { courseId: 'h04', level: 'higher', name: '11th PCB', track: 'Hindi', fee: 1750 },
  { courseId: 'h05', level: 'higher', name: '11th Commerce', track: 'English', fee: 1600 },
  { courseId: 'h06', level: 'higher', name: '11th Arts', track: 'English', fee: 1400 },
  { courseId: 'h07', level: 'higher', name: '11th Arts', track: 'Hindi', fee: 1200 },
  { courseId: 'h08', level: 'higher', name: '11th PCM IIT Integrated', track: 'English', fee: 2500 },
  { courseId: 'h09', level: 'higher', name: '11th PCB NEET Integrated', track: 'English', fee: 2500 },
  { courseId: 'h10', level: 'higher', name: '11th PCB NEET Integrated', track: 'Hindi', fee: 2250 },
  // CLASS 12
  { courseId: 'h11', level: 'higher', name: '12th PCM', track: 'English', fee: 2250 },
  { courseId: 'h12', level: 'higher', name: '12th PCM', track: 'Hindi', fee: 2000 },
  { courseId: 'h13', level: 'higher', name: '12th PCB', track: 'English', fee: 2250 },
  { courseId: 'h14', level: 'higher', name: '12th PCB', track: 'Hindi', fee: 2000 },
  { courseId: 'h15', level: 'higher', name: '12th Commerce', track: 'English', fee: 1600 },
  { courseId: 'h16', level: 'higher', name: '12th Arts', track: 'English', fee: 1750 },
  { courseId: 'h17', level: 'higher', name: '12th Arts', track: 'Hindi', fee: 1500 },
  { courseId: 'h18', level: 'higher', name: '12th PCM IIT Integrated', track: 'English', fee: 2750 },
  { courseId: 'h19', level: 'higher', name: '12th PCB NEET Integrated', track: 'English', fee: 2750 },
  { courseId: 'h20', level: 'higher', name: '12th PCB NEET Integrated', track: 'Hindi', fee: 2500 },
  // SPECIAL EDU PLANS
  { courseId: 'h21', level: 'higher', name: '11th PCM Special Edu Plan', track: 'English', fee: 9000 },
  { courseId: 'h22', level: 'higher', name: '11th PCB Special Edu Plan', track: 'English', fee: 7500 },
  { courseId: 'h23', level: 'higher', name: '12th PCM Special Edu Plan', track: 'English', fee: 11000 },
  { courseId: 'h24', level: 'higher', name: '12th PCB Special Edu Plan', track: 'English', fee: 9000 },
  { courseId: 'h25', level: 'higher', name: 'Integrated PCB 1-Year NEET Plan', track: 'English', fee: 7500 },
  { courseId: 'h26', level: 'higher', name: 'Integrated PCM 1-Year IIT Plan', track: 'English', fee: 12500 },
  // UNIVERSITY UG
  { courseId: 'u01', level: 'university', name: 'Graduation Arts', track: 'Bilingual', fee: 8000 },
  { courseId: 'u02', level: 'university', name: 'Graduation Commerce', track: 'Bilingual', fee: 10000 },
  { courseId: 'u03', level: 'university', name: 'Graduation Physics (H)', track: 'Bilingual', fee: 12000 },
  { courseId: 'u04', level: 'university', name: 'Graduation Chemistry (H)', track: 'Bilingual', fee: 10000 },
  { courseId: 'u05', level: 'university', name: 'Graduation Mathematics (H)', track: 'Bilingual', fee: 14000 },
  // UNIVERSITY PG
  { courseId: 'u06', level: 'university', name: 'M.Com', track: 'Bilingual', fee: 4000 },
  { courseId: 'u07', level: 'university', name: 'M.Sc Physics', track: 'Bilingual', fee: 4000 },
  { courseId: 'u08', level: 'university', name: 'M.Sc Chemistry', track: 'Bilingual', fee: 4000 },
  { courseId: 'u09', level: 'university', name: 'M.Sc Mathematics', track: 'Bilingual', fee: 5000 },
  { courseId: 'u10', level: 'university', name: 'MA History', track: 'Bilingual', fee: 2750 },
  { courseId: 'u11', level: 'university', name: 'MA Political Science', track: 'Bilingual', fee: 2750 },
  { courseId: 'u12', level: 'university', name: 'MA Sociology', track: 'Bilingual', fee: 2750 },
  { courseId: 'u13', level: 'university', name: 'MA Philosophy', track: 'Bilingual', fee: 2750 },
  { courseId: 'u14', level: 'university', name: 'MA Psychology', track: 'Bilingual', fee: 2750 },
  { courseId: 'u15', level: 'university', name: 'MA Geology', track: 'Bilingual', fee: 3000 },
  // BANKING
  { courseId: 'c01', level: 'competitive', name: 'Banking Clerk', track: 'General', fee: 3000 },
  { courseId: 'c02', level: 'competitive', name: 'Banking PO', track: 'General', fee: 5000 },
  // UPSC
  { courseId: 'c03', level: 'competitive', name: 'UPSC Pre — Hindi Medium', track: 'Hindi', fee: 5000 },
  { courseId: 'c04', level: 'competitive', name: 'UPSC Pre — English Medium', track: 'English', fee: 7500 },
  { courseId: 'c05', level: 'competitive', name: 'UPSC Mains — Hindi Medium', track: 'Hindi', fee: 10000 },
  { courseId: 'c06', level: 'competitive', name: 'UPSC Mains GS+Optional', track: 'English', fee: 10000 },
  { courseId: 'c07', level: 'competitive', name: 'UPSC & State PCS', track: 'English', fee: 10000 },
  // BPSC
  { courseId: 'c08', level: 'competitive', name: 'BPSC Pre — Hindi Medium', track: 'Hindi', fee: 3000 },
  { courseId: 'c09', level: 'competitive', name: 'BPSC Pre — English Medium', track: 'English', fee: 7500 },
  { courseId: 'c10', level: 'competitive', name: 'BPSC Mains GS+Optional', track: 'English', fee: 7500 },
  // JPSC
  { courseId: 'c11', level: 'competitive', name: 'JPSC Pre — Hindi Medium', track: 'Hindi', fee: 3000 },
  { courseId: 'c12', level: 'competitive', name: 'JPSC Pre — English Medium', track: 'English', fee: 3500 },
  { courseId: 'c13', level: 'competitive', name: 'JPSC Mains GS+Optional', track: 'English', fee: 7500 },
  // STATE PCS
  { courseId: 'c14', level: 'competitive', name: 'Combined State Pre — Hindi', track: 'Hindi', fee: 7500 },
  { courseId: 'c15', level: 'competitive', name: 'Combined State PCS Pre — English', track: 'English', fee: 7500 },
  { courseId: 'c16', level: 'competitive', name: 'State Mains Combined PCS', track: 'English', fee: 12500 },
  // TET / BPSC TEACHER
  { courseId: 'c17', level: 'competitive', name: 'C-TET / S-TET (Class 0–5)', track: 'General', fee: 1500 },
  { courseId: 'c18', level: 'competitive', name: 'C-TET / S-TET (Class 6–8)', track: 'General', fee: 2000 },
  { courseId: 'c19', level: 'competitive', name: 'C-TET / S-TET (Class 9–10)', track: 'General', fee: 2250 },
  { courseId: 'c20', level: 'competitive', name: 'BPSC Teacher (Class 0–5)', track: 'General', fee: 2500 },
  { courseId: 'c21', level: 'competitive', name: 'BPSC Teacher (Class 6–8)', track: 'General', fee: 2750 },
  { courseId: 'c22', level: 'competitive', name: 'BPSC Teacher (Class 9–10)', track: 'General', fee: 3000 },
  { courseId: 'c23', level: 'competitive', name: 'BPSC Teacher (Class 11–12)', track: 'General', fee: 3500 },
  // DEFENCE / LAW / MGMT
  { courseId: 'c24', level: 'competitive', name: 'NDA Preparation', track: 'General', fee: 3000 },
  { courseId: 'c25', level: 'competitive', name: 'CDS Preparation', track: 'General', fee: 6000 },
  { courseId: 'c26', level: 'competitive', name: 'CLAT', track: 'General', fee: 2000 },
  { courseId: 'c27', level: 'competitive', name: 'MAT Preparation', track: 'General', fee: 4000 },
  { courseId: 'c28', level: 'competitive', name: 'CAT Preparation', track: 'General', fee: 5000 },
  // TECH & CODING
  { courseId: 'p01', level: 'professional', name: '.Net Coding', track: 'English', fee: 6000 },
  { courseId: 'p02', level: 'professional', name: 'PHP Coding', track: 'English', fee: 9000 },
  { courseId: 'p03', level: 'professional', name: 'Advance Coding', track: 'English', fee: 10000 },
  { courseId: 'p04', level: 'professional', name: 'WordPress CMS', track: 'English', fee: 900 },
  { courseId: 'p05', level: 'professional', name: 'C++ Preparation', track: 'English', fee: 9000 },
  { courseId: 'p06', level: 'professional', name: 'Java Preparation', track: 'English', fee: 9000 },
  // SKILL / PROFESSIONAL
  { courseId: 'p07', level: 'professional', name: 'English Spoken', track: 'English', fee: 1500 },
  { courseId: 'p08', level: 'professional', name: 'Graphic Designing', track: 'English', fee: 2000 },
  { courseId: 'p09', level: 'professional', name: 'UGC NET Preparation', track: 'General', fee: 10000 },
  { courseId: 'p10', level: 'professional', name: 'HR Nourishment Program', track: 'English', fee: 20000 },
  { courseId: 'p11', level: 'professional', name: 'Marketing Nourishment Program', track: 'English', fee: 20000 },
  { courseId: 'p12', level: 'professional', name: 'CS Nourishment Program', track: 'English', fee: 20000 }
];

async function seedDefaultCourses() {
  await Promise.all(
    defaultCourses.map((course) =>
      Course.updateOne(
        { courseId: course.courseId },
        { $set: course },
        { upsert: true }
      )
    )
  );
}

// Creates default admin
async function seedDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      'ADMIN_EMAIL / ADMIN_PASSWORD not set in .env — skipping default admin seed.'
    );
    return;
  }

  const existing = await Admin.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!existing) {
    await Admin.create({
      name: 'Administrator',
      email,
      password,
    });
    console.log(`Default admin account created for ${email}`);
  } else {
    // Sync the password with the environment file if it exists
    existing.password = password;
    await existing.save();
    console.log(`Default admin account password updated/synced for ${email}`);
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

      console.error(
        `MongoDB connection failed (attempt ${attempt}/${maxRetries}):`,
        err.message
      );

      if (attempt === maxRetries) {
        throw err;
      }

      console.log(
        `Retrying MongoDB connection in ${waitMs / 1000}s...`
      );

      await sleep(waitMs);
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn(
    'MongoDB disconnected. Waiting for automatic reconnection...'
  );
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

connectToMongoWithRetry()
  .then(() =>
    Promise.all([
      seedDefaultCourses(),
      seedDefaultAdmin(),
    ])
  )
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ STARTUP ERROR:");
    console.error(err);
    process.exit(1);
  });