const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    track: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      trim: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    materials: {
      type: [{
        title: { type: String, required: true },
        type: { type: String, enum: ['youtube', 'pdf', 'doc', 'other', 'live'], required: true },
        url: { type: String, required: true }, // Base64 data URL for PDF/doc or Youtube links
        createdAt: { type: Date, default: Date.now }
      }],
      default: []
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
