import React from 'react';
import { Calendar, Clock, FileText, Award, AlertCircle } from 'lucide-react';
import { Assignment } from '../types';

interface AssignmentCardProps {
  assignment: Assignment;
  isInstructor?: boolean;
  onClick?: () => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  isInstructor = false,
  onClick
}) => {
  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'graded':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'submitted':
        return <FileText className="h-4 w-4" />;
      case 'graded':
        return <Award className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'submitted' && assignment.status !== 'graded';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer ${
        isOverdue ? 'border-l-4 border-l-red-500' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{assignment.description}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
          {getStatusIcon(assignment.status)}
          <span className="ml-1 capitalize">{assignment.status}</span>
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-1" />
            <span>{assignment.maxPoints} pts</span>
          </div>
        </div>
        
        {assignment.grade !== undefined && (
          <div className="flex items-center font-medium text-blue-600">
            <Award className="h-4 w-4 mr-1" />
            <span>{assignment.grade}/{assignment.maxPoints}</span>
          </div>
        )}
      </div>
      
      {assignment.fileName && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-2" />
            <span>{assignment.fileName}</span>
            <span className="ml-2 text-gray-400">({assignment.fileSize})</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;