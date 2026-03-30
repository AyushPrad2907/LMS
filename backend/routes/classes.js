const express = require('express');
const Class = require('../models/Class');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// POST /api/classes/create  (teacher only)
router.post('/create', protect, restrictTo('teacher'), async (req, res) => {
  try {
    const { title, meetingLink } = req.body;

    if (!title || !meetingLink) {
      return res.status(400).json({ success: false, message: 'Title and meeting link are required.' });
    }

    const newClass = await Class.create({
      title,
      meetingLink,
      teacherId: req.user._id,
      teacherName: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully.',
      class: newClass,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/classes/all  (any authenticated user)
router.get('/all', protect, async (req, res) => {
  try {
    let classes;

    if (req.user.role === 'teacher') {
      // Teachers see only their own classes
      classes = await Class.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
    } else {
      // Students see all classes
      classes = await Class.find().sort({ createdAt: -1 });
    }

    res.json({ success: true, count: classes.length, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// DELETE /api/classes/:id  (teacher only, own classes)
router.delete('/:id', protect, restrictTo('teacher'), async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);

    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    if (cls.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own classes.' });
    }

    await cls.deleteOne();
    res.json({ success: true, message: 'Class deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
