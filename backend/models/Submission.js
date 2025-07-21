const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'graded', 'accepted', 'rejected'],
    default: 'submitted'
  },
  comments: {
    type: String,
    default: ''
  },
  teacherComments: {
    type: String,
    default: ''
  },
  isLate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Check if submission is late
submissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const assignment = await mongoose.model('Assignment').findById(this.assignment);
    if (assignment && new Date() > assignment.dueDate) {
      this.isLate = true;
    }
  }
  next();
});

module.exports = mongoose.model('Submission', submissionSchema);