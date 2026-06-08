const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Student = require('../models/Student');

router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find().populate('lab', 'labName labCode building');
    const batchesWithCount = await Promise.all(batches.map(async (b) => {
      const count = await Student.countDocuments({ batch: b._id });
      return { ...b.toObject(), studentCount: count };
    }));
    res.json(batchesWithCount);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('lab');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    const students = await Student.find({ batch: req.params.id });
    res.json({ ...batch.toObject(), students });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const batch = new Batch(req.body);
    const saved = await batch.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Student.updateMany({ batch: req.params.id }, { batch: null });
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get students in batch
router.get('/:id/students', async (req, res) => {
  try {
    const students = await Student.find({ batch: req.params.id });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
