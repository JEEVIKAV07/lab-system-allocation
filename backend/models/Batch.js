const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true, trim: true },
  batchCode: { type: String, required: true, unique: true, trim: true },
  lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  maxCapacity: { type: Number, required: true, default: 30 },
  schedule: {
    day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
    startTime: { type: String },
    endTime: { type: String },
  },
  subject: { type: String, required: true },
  instructor: { type: String, required: true },
  semester: { type: Number, required: true },
  department: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
