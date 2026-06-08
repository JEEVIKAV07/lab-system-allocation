const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const { batch, date } = req.query;
    let filter = {};
    if (batch) filter.batch = batch;
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
    }
    const records = await Attendance.find(filter)
      .populate('batch', 'batchName batchCode subject')
      .populate('records.student', 'name rollNumber');
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Mark attendance for a batch
router.post('/', async (req, res) => {
  try {
    const { batch, date, records, markedBy } = req.body;
    const d = new Date(date);
    // Check if attendance already marked
    const existing = await Attendance.findOne({
      batch,
      date: { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(new Date(date).setHours(23,59,59,999)) }
    });
    if (existing) {
      existing.records = records;
      existing.markedBy = markedBy || 'Admin';
      const updated = await existing.save();
      return res.json(updated);
    }
    const attendance = new Attendance({ batch, date, records, markedBy });
    const saved = await attendance.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Get attendance summary for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const records = await Attendance.find({ 'records.student': req.params.studentId })
      .populate('batch', 'batchName subject');
    const summary = records.map(r => {
      const rec = r.records.find(x => x.student.toString() === req.params.studentId);
      return { date: r.date, batch: r.batch, status: rec?.status, remarks: rec?.remarks };
    });
    const total = summary.length;
    const present = summary.filter(s => s.status === 'Present').length;
    res.json({ summary, total, present, percentage: total ? Math.round((present/total)*100) : 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get attendance for a batch on a date
router.get('/batch/:batchId', async (req, res) => {
  try {
    const records = await Attendance.find({ batch: req.params.batchId })
      .populate('records.student', 'name rollNumber')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
