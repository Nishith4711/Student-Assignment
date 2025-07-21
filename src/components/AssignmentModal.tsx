import React, { useState } from 'react';
import { X, Upload, FileText, Calendar, Award, MessageCircle, Save } from 'lucide-react';
import { Assignment, Comment } from '../types';

interface AssignmentModalProps {
  assignment: Assignment;
  comments: Comment[];
  isInstructor: boolean;
  onClose: () => void;
  onGrade?: (grade: number, feedback: string) => void;
  onComment?: (content: string, type: 'feedback' | 'question' | 'note') => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  assignment,
  comments,
  isInstructor,
  onClose,
  onGrade,
  onComment
}) => {
  const [grade, setGrade] = useState(assignment.grade?.toString() || '');
  const [feedback, setFeedback] = useState(assignment.feedback || '');
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'feedback' | 'question' | 'note'>('feedback');

  const handleSaveGrade = () => {
    if (onGrade && grade) {
      onGrade(parseInt(grade), feedback);
    }
  };

  const handleAddComment = () => {
    if (onComment && newComment.trim()) {
      onComment(newComment.trim(), commentType);
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Award className="h-4 w-4 mr-2" />
              <span>{assignment.maxPoints} points</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FileText className="h-4 w-4 mr-2" />
              <span>Subject: {assignment.subject}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{assignment.description}</p>
          </div>
          
          {assignment.fileName && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitted File</h3>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{assignment.fileName}</div>
                  <div className="text-sm text-gray-500">{assignment.fileSize}</div>
                </div>
              </div>
            </div>
          )}
          
          {isInstructor && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Grading</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                    Grade (out of {assignment.maxPoints})
                  </label>
                  <input
                    type="number"
                    id="grade"
                    min="0"
                    max={assignment.maxPoints}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSaveGrade}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Grade
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide detailed feedback for the student..."
                />
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Comments & Discussion
            </h3>
            
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <select
                  value={commentType}
                  onChange={(e) => setCommentType(e.target.value as 'feedback' | 'question' | 'note')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="feedback">Feedback</option>
                  <option value="question">Question</option>
                  <option value="note">Note</option>
                </select>
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a comment..."
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;