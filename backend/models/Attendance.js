const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  date: { type: Date, required: true },
  records: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Absent' },
    remarks: { type: String, default: '' },
  }],
  markedBy: { type: String, default: 'Admin' },
  sessionNumber: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
