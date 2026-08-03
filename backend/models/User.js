const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
    },
    coursesTaught: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }],
      default: []
    },
    contactNumber: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Profile / ID Card fields ──
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    guardianName: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },

    // ── NEW: forgot / reset password support ──
    // Never store the raw token — only its SHA256 hash. select:false keeps it
    // out of normal query results so it's never accidentally sent to the client.
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Auto-generate studentId for students
userSchema.pre('save', async function () {
  if (this.role === 'student' && !this.studentId) {
    const User = mongoose.model('User');
    const count = await User.countDocuments({ role: 'student', studentId: { $exists: true, $ne: null } });
    const seq = String(count + 1).padStart(4, '0');
    const now = new Date();
    const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const fyShort = `${String(fy).slice(-2)}-${String(fy + 1).slice(-2)}`;
    this.studentId = `IMPLEX-STU-${seq}/${fyShort}`;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);  