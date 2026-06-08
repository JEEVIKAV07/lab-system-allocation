const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  labName: { type: String, required: true, trim: true },
  labCode: { type: String, required: true, unique: true, trim: true },
  building: { type: String, required: true },
  floor: { type: Number, required: true },
  capacity: { type: Number, required: true },
  labType: { 
    type: String, 
    enum: ['Computer Lab', 'Electronics Lab', 'Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Network Lab', 'Other'],
    required: true 
  },
  equipment: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Lab', labSchema);
