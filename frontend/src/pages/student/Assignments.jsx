import React, { useState, useEffect } from 'react'
import { Calendar, Award, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { assignmentsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await assignmentsAPI.getStudentAssignments()
      setAssignments(response.data)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (assignment) => {
    if (assignment.submission) {
      switch (assignment.submission.status) {
        case 'graded':
          return <CheckCircle className="h-5 w-5 text-green-600" />
        case 'submitted':
          return <Clock className="h-5 w-5 text-blue-600" />
        default:
          return <FileText className="h-5 w-5 text-gray-600" />
      }
    }
    if (assignment.isOverdue) {
      return <AlertCircle className="h-5 w-5 text-red-600" />
    }
    return <Clock className="h-5 w-5 text-orange-600" />
  }

  const getStatusText = (assignment) => {
    if (assignment.submission) {
      switch (assignment.submission.status) {
        case 'graded':
          return 'Graded'
        case 'submitted':
          return 'Submitted'
        case 'under_review':
          return 'Under Review'
        default:
          return 'Submitted'
      }
    }
    if (assignment.isOverdue) {
      return 'Overdue'
    }
    return 'Pending'
  }

  const getStatusColor = (assignment) => {
    if (assignment.submission) {
      switch (assignment.submission.status) {
        case 'graded':
          return 'bg-green-100 text-green-800'
        case 'submitted':
          return 'bg-blue-100 text-blue-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
    if (assignment.isOverdue) {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-orange-100 text-orange-800'
  }

  const filteredAssignments = assignments.filter(assignment => {
    switch (filter) {
      case 'pending':
        return !assignment.submission && !assignment.isOverdue
      case 'submitted':
        return assignment.submission
      case 'overdue':
        return assignment.isOverdue
      default:
        return true
    }
  })

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600">Track your assignment progress and submissions</p>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Assignments</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => (
          <div key={assignment._id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{assignment.description}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment)}`}>
                {getStatusIcon(assignment)}
                <span className="ml-1">{getStatusText(assignment)}</span>
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                <span>{assignment.maxPoints} points</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span>{assignment.subject}</span>
              </div>
            </div>

            {assignment.submission && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <p>Submitted: {new Date(assignment.submission.submittedAt).toLocaleDateString()}</p>
                  {assignment.submission.isLate && (
                    <p className="text-red-600 font-medium">Late Submission</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600">No assignments match your current filter.</p>
        </div>
      )}
    </div>
  )
}

export default StudentAssignments