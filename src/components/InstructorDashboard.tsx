import React, { useState } from 'react';
import { Search, Filter, Users, Award, Clock, CheckCircle } from 'lucide-react';
import { Assignment, Comment } from '../types';
import AssignmentCard from './AssignmentCard';
import AssignmentModal from './AssignmentModal';

interface InstructorDashboardProps {
  assignments: Assignment[];
  comments: Comment[];
}

const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ assignments, comments }) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');

  const submittedAssignments = assignments.filter(a => a.status === 'submitted' || a.status === 'graded');

  const filteredAssignments = submittedAssignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'submittedAt':
        return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getAssignmentComments = (assignmentId: string) => {
    return comments.filter(comment => comment.assignmentId === assignmentId);
  };

  const handleGrade = (grade: number, feedback: string) => {
    if (selectedAssignment) {
      // Update assignment with grade and feedback
      console.log('Grading assignment:', selectedAssignment.id, { grade, feedback });
      // In a real app, this would update the state or make an API call
    }
  };

  const handleComment = (content: string, type: 'feedback' | 'question' | 'note') => {
    if (selectedAssignment) {
      // Add new comment
      console.log('Adding comment:', { content, type, assignmentId: selectedAssignment.id });
      // In a real app, this would update the state or make an API call
    }
  };

  const stats = {
    total: submittedAssignments.length,
    needsGrading: submittedAssignments.filter(a => a.status === 'submitted').length,
    graded: submittedAssignments.filter(a => a.status === 'graded').length,
    avgGrade: submittedAssignments.filter(a => a.grade).reduce((acc, a) => acc + (a.grade || 0), 0) / submittedAssignments.filter(a => a.grade).length || 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Dashboard</h1>
        <p className="text-gray-600">Review and grade student submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-gray-600">Total Submissions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.needsGrading}</p>
              <p className="text-gray-600">Needs Grading</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.graded}</p>
              <p className="text-gray-600">Graded</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.avgGrade.toFixed(1)}%</p>
              <p className="text-gray-600">Average Grade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter, and Sort */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="submitted">Needs Grading</option>
              <option value="graded">Graded</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="submittedAt">Submission Date</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            isInstructor={true}
            onClick={() => setSelectedAssignment(assignment)}
          />
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-600">No student submissions match your current filters.</p>
        </div>
      )}

      {/* Assignment Modal */}
      {selectedAssignment && (
        <AssignmentModal
          assignment={selectedAssignment}
          comments={getAssignmentComments(selectedAssignment.id)}
          isInstructor={true}
          onClose={() => setSelectedAssignment(null)}
          onGrade={handleGrade}
          onComment={handleComment}
        />
      )}
    </div>
  );
};

export default InstructorDashboard;