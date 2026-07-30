const express = require('express');
const Course = require('../models/Course');
const { protect, restrictTo, protectAdmin, protectUserOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/all', protectUserOrAdmin, async (req, res) => {
  try {
    // Admin should see both active and inactive courses, students/teachers only active ones
    const query = req.isAdmin ? {} : { isActive: true };
    const courses = await Course.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

router.post('/create', protectAdmin, async (req, res) => {
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

router.put('/:id', protectAdmin, async (req, res) => {
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

router.delete('/:id', protectAdmin, async (req, res) => {
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

// POST /api/courses/:id/materials - Add study material to a course
router.post('/:id/materials', protect, restrictTo('teacher'), async (req, res) => {
  try {
    const { title, type, url } = req.body;
    if (!title || !type || !url) {
      return res.status(400).json({ success: false, message: 'Title, type, and URL/Base64 are required.' });
    }
    if (!['youtube', 'pdf', 'doc', 'other', 'live'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid material type.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    course.materials.push({ title, type, url });
    await course.save();

    res.status(201).json({ success: true, message: 'Material added successfully.', materials: course.materials });
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// DELETE /api/courses/:id/materials/:materialId - Delete study material from a course
router.delete('/:id/materials/:materialId', protect, restrictTo('teacher'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    course.materials = course.materials.filter(m => m._id.toString() !== req.params.materialId);
    await course.save();

    res.json({ success: true, message: 'Material deleted successfully.', materials: course.materials });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
