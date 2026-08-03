const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Enrollment = require('../models/Enrollment');
const { protectAdmin } = require('../middleware/auth');

const router = express.Router();

// ── Admin login (separate from student/teacher login) ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign({ id: admin._id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── Get all enrollment requests ──
router.get('/enrollments', protectAdmin, async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── Approve / Reject an enrollment ("Ignore" simply does nothing client-side, status stays Pending) ──
router.put('/enrollments/:id/status', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    }

    res.json({ success: true, message: `Enrollment marked as ${status}.`, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── Get all registered users (Students, Teachers, Admins) with role & registration time ──
router.get('/users', protectAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const Admin = require('../models/Admin');

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });

    const formattedUsers = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role || 'student',
      contactNumber: u.contactNumber || '',
      studentId: u.studentId || '',
      bloodGroup: u.bloodGroup || '',
      profilePhoto: u.profilePhoto || '',
      guardianName: u.guardianName || '',
      address: u.address || '',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      type: 'user'
    }));

    const formattedAdmins = admins.map(a => ({
      _id: a._id,
      name: a.name,
      email: a.email,
      role: 'admin',
      contactNumber: '',
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      type: 'admin'
    }));

    const allRegisteredUsers = [...formattedAdmins, ...formattedUsers].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      count: allRegisteredUsers.length,
      users: allRegisteredUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users.' });
  }
});

// ── Update user role (Student <-> Teacher) ──
router.put('/users/:id/role', protectAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const { role } = req.body;

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be student or teacher.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: `User role updated to ${role}.`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating user role.' });
  }
});

// ── Delete a registered user ──
router.delete('/users/:id', protectAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
});

// ── Get comprehensive Admin Dashboard stats ──
router.get('/stats', protectAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');

    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    const adminCount = await Admin.countDocuments();
    
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ isActive: true });
    
    const totalEnrollments = await Enrollment.countDocuments();
    const pendingEnrollments = await Enrollment.countDocuments({ status: 'Pending' });
    const approvedEnrollments = await Enrollment.countDocuments({ status: 'Approved' });
    const rejectedEnrollments = await Enrollment.countDocuments({ status: 'Rejected' });

    // Calculate total revenue from approved enrollments
    const approvedList = await Enrollment.find({ status: 'Approved' });
    const totalRevenue = approvedList.reduce((sum, item) => sum + (item.fee || 0), 0);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers + adminCount, students: studentCount, teachers: teacherCount, admins: adminCount },
        courses: { total: totalCourses, active: activeCourses },
        enrollments: { total: totalEnrollments, pending: pendingEnrollments, approved: approvedEnrollments, rejected: rejectedEnrollments },
        revenue: totalRevenue
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats.' });
  }
});

module.exports = router;