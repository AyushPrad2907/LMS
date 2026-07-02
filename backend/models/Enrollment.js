const mongoose = require('mongoose');

// Full student details captured on the enrollment form.
// Not required at the schema level (kept flexible for the older /enroll route),
// but the new /submit route validates these before creating a document.
const studentDetailsSchema = new mongoose.Schema(
  {
    fullName: String,
    dob: String,
    father: String,
    mother: String,
    email: String,
    aadhar: String,
    mobile: String,
    altMobile: String,
    whatsapp: String,
    pin: String,
    address: String,
    school: String,
    class: String,
    medium: String,
    source: String,
    refName: String,
    refPhone: String,
  },
  { _id: false }
);

const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    track: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },

    // ── Student details (new) ──
    studentDetails: {
      type: studentDetailsSchema,
      default: undefined,
    },

    // ── Payment verification (new) ──
    passportPhoto: {
      type: String, // base64 data URL
    },
    utrNumber: {
      type: String,
      trim: true,
    },
    paymentScreenshot: {
      type: String, // base64 data URL
    },

    // ── Approval workflow (new) ──
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true } // createdAt doubles as the submission date
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);