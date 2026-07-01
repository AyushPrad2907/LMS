const express = require('express');
const Enrollment = require('../models/Enrollment');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

router.post('/enroll', protect, async (req, res) => {
  try {
    const { courseId, courseName, track, level, fee } = req.body;

    if (!courseId || !courseName || !track || !level || fee === undefined) {
      return res.status(400).json({ success: false, message: 'All course details are required.' });
    }

    const existing = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You are already enrolled in this course.' });
    }

    const enrollment = await Enrollment.create({
      userId: req.user._id,
      courseId,
      courseName,
      track,
      level,
      fee,
    });

    res.status(201).json({ success: true, message: 'Enrollment successful.', enrollment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You are already enrolled in this course.' });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
