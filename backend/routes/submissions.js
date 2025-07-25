const express = require('express');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload'); // ✅ now using Cloudinary
const router = express.Router();

// Submit assignment (student only)
router.post('/', auth, requireRole(['student']), upload.single('file'), async (req, res) => {
  try {
    console.log('=== SUBMISSION REQUEST START ===');
    console.log('User:', req.user.name, 'ID:', req.user._id);
    console.log('Body:', req.body);
    console.log('File:', req.file ? {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      cloudinaryUrl: req.file.path
    } : 'No file');

    const { assignmentId, comments } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: 'Assignment ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Removed the check for existingSubmission to allow multiple submissions

    const submission = new Submission({
      assignment: assignmentId,
      student: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path, // ✅ this will be Cloudinary URL
      fileSize: req.file.size,
      comments: comments || '',
      submittedAt: new Date()
    });

    await submission.save();

    await submission.populate([
      { path: 'assignment', select: 'title subject maxPoints dueDate' },
      { path: 'student', select: 'name email studentId' }
    ]);

    console.log('=== SUBMISSION SUCCESS ===');
    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission: submission
    });

  } catch (error) {
    console.error('=== SUBMISSION ERROR ===');
    res.status(500).json({ message: 'Server error: ' + error.message });
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
    console.error('Error fetching submissions:', error);
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
    console.error('Error fetching late submissions:', error);
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
    console.error('Error fetching my submissions:', error);
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
    console.error('Error updating submission status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ⚠️ Download submission file – Now returns Cloudinary URL
router.get('/:id/download', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (req.user.role === 'student' && submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // ✅ Cloudinary filePath is a URL
    res.json({
      message: 'File URL retrieved successfully',
      fileUrl: submission.filePath
    });

  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
