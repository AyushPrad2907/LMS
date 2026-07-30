const express = require('express');
const jwt = require('jsonwebtoken');
const DemoManager = require('../models/DemoManager');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const manager = await DemoManager.findOne({ email }).select('+password');
    
    if (!manager || !(await manager.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Usually you'd have process.env.JWT_SECRET, falling back for safety
    const secret = process.env.JWT_SECRET || 'secret123';
    
    const token = jwt.sign(
      { id: manager._id, role: 'demo_manager' },
      secret,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// A helper route to create a Demo Manager (you can use this once via Postman to create the account, then remove it)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await DemoManager.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Manager already exists' });
        }
        const manager = await DemoManager.create({ name, email, password });
        res.status(201).json({ success: true, message: 'Manager created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
