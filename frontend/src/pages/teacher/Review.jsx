import React, { useState, useEffect } from 'react'
import { FileText, Calendar, User, Download, MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import { submissionsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const TeacherReview = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [teacherComments, setTeacherComments] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await submissionsAPI.getAll()
      setSubmissions(response.data)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (submissionId, status) => {
    setUpdating(true)
    try {
      await submissionsAPI.updateStatus(submissionId, { 
        status, 
        teacherComments 
      })
      
      // Update local state
      setSubmissions(submissions.map(sub => 
        sub._id === submissionId 
          ? { ...sub, status, teacherComments }
          : sub
      ))
      
      setSelectedSubmission(null)
      setTeacherComments('')
      toast.success(`Assignment ${status.replace('_', ' ')}`)
    } catch (error) {
      console.error('Error updating submission:', error)
      toast.error('Failed to update submission')
    } finally {
      setUpdating(false)
    }
  }

  const handleDownload = async (submissionId, fileName) => {
    try {
      const response = await submissionsAPI.download(submissionId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Failed to download file')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800'
      case 'accepted':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    switch (filter) {
      case 'pending':
        return submission.status === 'submitted'
      case 'under_review':
        return submission.status === 'under_review'
      case 'graded':
        return submission.status === 'graded'
      case 'accepted':
        return submission.status === 'accepted'
      case 'rejected':
        return submission.status === 'rejected'
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
          <h1 className="text-3xl font-bold text-gray-900">Review Assignments</h1>
          <p className="text-gray-600">Review and manage student submissions</p>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Submissions</option>
          <option value="pending">Pending Review</option>
          <option value="under_review">Under Review</option>
          <option value="graded">Graded</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSubmissions.map((submission) => (
          <div key={submission._id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {submission.assignment.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{submission.assignment.subject}</p>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <User className="h-4 w-4 mr-1" />
                  <span>{submission.student.name} ({submission.student.studentId})</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                {submission.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span>{submission.fileName}</span>
              </div>
              {submission.isLate && (
                <div className="text-red-600 font-medium">
                  Late Submission
                </div>
              )}
            </div>

            {submission.comments && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-1">Student Comments:</h4>
                <p className="text-gray-700 text-sm">{submission.comments}</p>
              </div>
            )}

            {submission.teacherComments && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-1">Teacher Comments:</h4>
                <p className="text-gray-700 text-sm">{submission.teacherComments}</p>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => handleDownload(submission._id, submission.fileName)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
              <button
                onClick={() => {
                  setSelectedSubmission(submission)
                  setTeacherComments(submission.teacherComments || '')
                }}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors duration-200"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Review
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-600">No submissions match your current filter.</p>
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Review: {selectedSubmission.assignment.title}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <span className="font-medium text-gray-700">Student: </span>
                  <span>{selectedSubmission.student.name} ({selectedSubmission.student.studentId})</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">File: </span>
                  <span>{selectedSubmission.fileName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Submitted: </span>
                  <span>{new Date(selectedSubmission.submittedAt).toLocaleDateString()}</span>
                </div>
                {selectedSubmission.isLate && (
                  <div className="text-red-600 font-medium">
                    This is a late submission
                  </div>
                )}
              </div>

              {selectedSubmission.comments && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Student Comments:</h3>
                  <p className="text-gray-700">{selectedSubmission.comments}</p>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="teacherComments" className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Comments
                </label>
                <textarea
                  id="teacherComments"
                  value={teacherComments}
                  onChange={(e) => setTeacherComments(e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Add your comments about this submission..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleStatusUpdate(selectedSubmission._id, 'accepted')}
                  disabled={updating}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedSubmission._id, 'rejected')}
                  disabled={updating}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedSubmission._id, 'under_review')}
                  disabled={updating}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mark Under Review
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherReview