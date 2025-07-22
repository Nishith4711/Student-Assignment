const express = require('express');
const { body, validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all assignments (for both students and teachers)
router.get('/', auth, async (req, res) => {
  try {
    console.log('=== GET ASSIGNMENTS REQUEST ===');
    console.log('User:', req.user.name, 'Role:', req.user.role);
    
    const assignments = await Assignment.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('Found assignments:', assignments.length);
    assignments.forEach(a => console.log(`- ${a.title} (ID: ${a._id})`));
    
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get assignments for student (with submission status)
router.get('/student', auth, requireRole(['student']), async (req, res) => {
  try {
    console.log('=== GET STUDENT ASSIGNMENTS REQUEST ===');
    console.log('Student:', req.user.name, 'ID:', req.user._id);
    
    const assignments = await Assignment.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    console.log('Found assignments for student:', assignments.length);

    // Get submissions for this student
    const submissions = await Submission.find({ student: req.user._id });
    console.log('Found submissions for student:', submissions.length);
    
    const submissionMap = {};
    submissions.forEach(sub => {
      submissionMap[sub.assignment.toString()] = sub;
    });

    // Add submission status to assignments
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = submissionMap[assignment._id.toString()];
      return {
        ...assignment.toObject(),
        submission: submission || null,
        status: submission ? submission.status : 'not_submitted',
        isOverdue: !submission && new Date() > assignment.dueDate
      };
    });

    console.log('Assignments with status:', assignmentsWithStatus.length);

    res.json(assignmentsWithStatus);
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Create assignment (teacher only)
router.post('/', auth, requireRole(['teacher']), [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('maxPoints').isNumeric().withMessage('Max points must be a number'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  try {
    console.log('=== CREATE ASSIGNMENT REQUEST ===');
    console.log('Teacher:', req.user.name);
    console.log('Assignment data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        errors: errors.array() 
      });
    }

    const assignment = new Assignment({
      ...req.body,
      createdBy: req.user._id
    });

    await assignment.save();
    await assignment.populate('createdBy', 'name email');

    console.log('Assignment created successfully:', assignment._id);

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update assignment (teacher only)
router.put('/:id', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ 
        message: 'Assignment not found' 
      });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized' 
      });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('createdBy', 'name email');

    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Delete assignment (teacher only)
router.delete('/:id', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ 
        message: 'Assignment not found' 
      });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized' 
      });
    }

    assignment.isActive = false;
    await assignment.save();

    res.json({ 
      message: 'Assignment deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;