const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Class title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    meetingLink: {
      type: String,
      required: [true, 'Meeting link is required'],
      trim: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);
