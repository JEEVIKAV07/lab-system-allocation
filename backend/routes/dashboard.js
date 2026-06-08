const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Lab = require('../models/Lab');
const Attendance = require('../models/Attendance');

router.get('/stats', async (req, res) => {
  try {
    const [totalStudents, totalBatches, totalLabs, unallocated] = await Promise.all([
      Student.countDocuments(),
      Batch.countDocuments(),
      Lab.countDocuments(),
      Student.countDocuments({ batch: null }),
    ]);

    const batches = await Batch.find().populate('lab', 'labName');
    const batchStats = await Promise.all(batches.map(async (b) => {
      const count = await Student.countDocuments({ batch: b._id });
      return { name: b.batchName, code: b.batchCode, count, capacity: b.maxCapacity, lab: b.lab?.labName };
    }));

    // Recent attendance
    const recentAttendance = await Attendance.find()
      .populate('batch', 'batchName')
      .sort({ date: -1 })
      .limit(5);

    res.json({ totalStudents, totalBatches, totalLabs, unallocated, batchStats, recentAttendance });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
