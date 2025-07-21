const express = require('express');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

// Submit assignment (student only)
router.post('/', auth, requireRole(['student']), upload.single('file'), async (req, res) => {
  try {
    const { assignmentId, comments } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    const submission = new Submission({
      assignment: assignmentId,
      student: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      comments: comments || ''
    });

    await submission.save();
    await submission.populate([
      { path: 'assignment', select: 'title subject maxPoints dueDate' },
      { path: 'student', select: 'name email studentId' }
    ]);

    res.status(201).json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all submissions (teacher only)
router.get('/', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('assignment', 'title subject maxPoints dueDate')
      .populate('student', 'name email studentId')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get late submissions (teacher only)
router.get('/late', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const lateSubmissions = await Submission.find({ isLate: true })
      .populate('assignment', 'title subject maxPoints dueDate')
      .populate('student', 'name email studentId')
      .sort({ submittedAt: -1 });

    res.json(lateSubmissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's submissions
router.get('/my-submissions', auth, requireRole(['student']), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title subject maxPoints dueDate')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update submission status (teacher only)
router.put('/:id/status', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const { status, teacherComments } = req.body;
    
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, teacherComments },
      { new: true }
    ).populate([
      { path: 'assignment', select: 'title subject maxPoints dueDate' },
      { path: 'student', select: 'name email studentId' }
    ]);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download submission file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check authorization
    if (req.user.role === 'student' && submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.download(submission.filePath, submission.fileName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;