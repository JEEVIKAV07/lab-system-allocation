const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Batch = require('../models/Batch');

// Allocate student to batch
router.post('/assign', async (req, res) => {
  try {
    const { studentId, batchId } = req.body;
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    const currentCount = await Student.countDocuments({ batch: batchId });
    if (currentCount >= batch.maxCapacity) {
      return res.status(400).json({ message: 'Batch is full' });
    }
    const student = await Student.findByIdAndUpdate(studentId, { batch: batchId }, { new: true }).populate('batch');
    res.json(student);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Remove student from batch
router.post('/unassign', async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findByIdAndUpdate(studentId, { batch: null }, { new: true });
    res.json(student);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Bulk allocate
router.post('/bulk-assign', async (req, res) => {
  try {
    const { studentIds, batchId } = req.body;
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    const currentCount = await Student.countDocuments({ batch: batchId });
    if (currentCount + studentIds.length > batch.maxCapacity) {
      return res.status(400).json({ message: `Cannot add ${studentIds.length} students. Only ${batch.maxCapacity - currentCount} slots available.` });
    }
    await Student.updateMany({ _id: { $in: studentIds } }, { batch: batchId });
    res.json({ message: `${studentIds.length} students allocated successfully` });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
