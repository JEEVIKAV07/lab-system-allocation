const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rollNumber: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  section: { type: String, required: true },
  phone: { type: String },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
