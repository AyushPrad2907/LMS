const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendResetEmail = require('../utils/sendResetEmail');

const router = express.Router();

// Helper: generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be student or teacher.' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Create user (password hashed in model pre-save)
    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, coursesTaught: user.coursesTaught || [] },
    });
  } catch (error) {
    console.error('Register error:', error);

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, coursesTaught: user.coursesTaught || [] },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/auth/me  (verify token & get current user)
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ══════════════════════════════════════════════
// NEW: FORGOT PASSWORD
// ══════════════════════════════════════════════

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  // Always the same message, whether or not the email exists — never reveal account existence.
  const genericMessage = 'If an account with that email exists, a password reset link has been sent.';

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({ success: true, message: genericMessage });
    }

    // Generate a raw token to email to the user, and store only its SHA256 hash.
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const resetLink = `https://www.implexedu.online/reset-password?token=${rawToken}`;

    try {
      await sendResetEmail(user.email, user.name, resetLink);
    } catch (emailError) {
      console.error('Reset email failed to send:', emailError.message);
      // Don't leave a dangling, unusable token if the email never went out.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Could not send reset email. Please try again later.' });
    }

    res.json({ success: true, message: genericMessage });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // select() explicitly needed since these fields are select:false on the schema
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired.' });
    }

    user.password = password; // re-hashed automatically by the existing pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now sign in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// PUT /api/auth/teacher/courses - Set courses taught by the teacher
router.put('/teacher/courses', protect, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Access denied. Teachers only.' });
    }

    const { courseIds } = req.body;
    if (!Array.isArray(courseIds)) {
      return res.status(400).json({ success: false, message: 'courseIds must be an array.' });
    }

    const user = await User.findById(req.user._id);
    user.coursesTaught = courseIds;
    await user.save();

    res.json({
      success: true,
      message: 'Courses updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        coursesTaught: user.coursesTaught
      }
    });
  } catch (error) {
    console.error('Update teacher courses error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/verify-password
router.post('/verify-password', protect, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    res.json({ success: true, message: 'Password verified.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;