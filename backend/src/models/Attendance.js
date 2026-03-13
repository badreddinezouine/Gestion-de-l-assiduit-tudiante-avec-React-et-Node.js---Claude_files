import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode'
  },
  date: {
    type: Date,
    default: Date.now
  },
  present: {
    type: Boolean,
    default: true
  },
  scanTime: {
    type: Date,
    default: Date.now
  },
  courseName: String,
  studentName: String
}, {
  timestamps: true
});

// Index pour éviter les doublons
attendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;