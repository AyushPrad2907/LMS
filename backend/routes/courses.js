const express = require('express');
const Course = require('../models/Course');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/all', protect, async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

router.post('/create', protect, restrictTo('teacher'), async (req, res) => {
  try {
    const { courseId, name, track, level, fee } = req.body;

    if (!courseId || !name || !track || !level || fee === undefined) {
      return res.status(400).json({ success: false, message: 'All course fields are required.' });
    }

    const course = await Course.create({
      courseId,
      name,
      track,
      level,
      fee,
      isActive: true,
    });

    res.status(201).json({ success: true, message: 'Course created successfully.', course });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Course ID already exists.' });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

router.put('/:id', protect, restrictTo('teacher'), async (req, res) => {
  try {
    const { name, track, level, fee, isActive } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { name, track, level, fee, isActive } },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    res.json({ success: true, message: 'Course updated successfully.', course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

router.delete('/:id', protect, restrictTo('teacher'), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    res.json({ success: true, message: 'Course deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
