const express = require('express');
const QRCode = require('qrcode');
const { protect } = require('../middleware/auth');

const router = express.Router();

const UPI_ID = '7859088239@okbizaxis';
const PAYEE_NAME = 'Implex Edu';

// Generates a dynamic UPI payment link + QR code for the selected course.
// The amount always comes from the course actually selected — never hardcoded.
router.post('/generate-qr', protect, async (req, res) => {
  try {
    const { courseId, courseName, fee } = req.body;

    if (!courseId || !courseName || fee === undefined) {
      return res.status(400).json({ success: false, message: 'Course details are required to generate the payment QR.' });
    }

    const amount = Number(fee);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid course price.' });
    }

    const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR`;
    const qrImage = await QRCode.toDataURL(upiLink, { width: 320, margin: 1 });

    res.json({
      success: true,
      upiLink,
      qrImage,
      upiId: UPI_ID,
      amount,
      courseId,
      courseName,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not generate payment QR. Please try again.' });
  }
});

module.exports = router;