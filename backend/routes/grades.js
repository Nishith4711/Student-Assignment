const express = require('express');
const Grade = require('../models/Grade');
const Submission = require('../models/Submission');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Assign grade (teacher only)
router.post('/', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const { submissionId, points, feedback } = req.body;

    const submission = await Submission.findById(submissionId)
      .populate('assignment', 'maxPoints');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (points > submission.assignment.maxPoints) {
      return res.status(400).json({ message: 'Points cannot exceed maximum points' });
    }

    // Check if grade already exists
    const existingGrade = await Grade.findOne({ submission: submissionId });
    if (existingGrade) {
      // Update existing grade
      existingGrade.points = points;
      existingGrade.feedback = feedback;
      existingGrade.gradedAt = new Date();
      await existingGrade.save();
      
      // Update submission status
      submission.status = 'graded';
      await submission.save();

      await existingGrade.populate([
        { path: 'assignment', select: 'title subject maxPoints' },
        { path: 'student', select: 'name email studentId' },
        { path: 'submission', select: 'fileName submittedAt' }
      ]);

      return res.json(existingGrade);
    }

    const grade = new Grade({
      submission: submissionId,
      assignment: submission.assignment._id,
      student: submission.student,
      teacher: req.user._id,
      points,
      feedback
    });

    await grade.save();

    // Update submission status
    submission.status = 'graded';
    await submission.save();

    await grade.populate([
      { path: 'assignment', select: 'title subject maxPoints' },
      { path: 'student', select: 'name email studentId' },
      { path: 'submission', select: 'fileName submittedAt' }
    ]);

    res.status(201).json(grade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all grades (teacher only)
router.get('/', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate('assignment', 'title subject maxPoints')
      .populate('student', 'name email studentId')
      .populate('submission', 'fileName submittedAt')
      .sort({ gradedAt: -1 });

    res.json(grades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's grades
router.get('/my-grades', auth, requireRole(['student']), async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.user._id })
      .populate('assignment', 'title subject maxPoints')
      .populate('submission', 'fileName submittedAt')
      .sort({ gradedAt: -1 });

    res.json(grades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update grade (teacher only)
router.put('/:id', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const { points, feedback } = req.body;
    
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    if (grade.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    grade.points = points;
    grade.feedback = feedback;
    grade.gradedAt = new Date();
    await grade.save();

    await grade.populate([
      { path: 'assignment', select: 'title subject maxPoints' },
      { path: 'student', select: 'name email studentId' },
      { path: 'submission', select: 'fileName submittedAt' }
    ]);

    res.json(grade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;