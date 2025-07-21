import React, { useState, useEffect } from 'react'
import { Clock, User, Calendar, FileText, Download, AlertCircle } from 'lucide-react'
import { submissionsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const LateSubmissions = () => {
  const [lateSubmissions, setLateSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLateSubmissions()
  }, [])

  const fetchLateSubmissions = async () => {
    try {
      const response = await submissionsAPI.getLateSubmissions()
      setLateSubmissions(response.data)
    } catch (error) {
      console.error('Error fetching late submissions:', error)
      toast.error('Failed to load late submissions')
    } finally {
      setLoading(false)
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

  const calculateLateDays = (dueDate, submittedAt) => {
    const due = new Date(dueDate)
    const submitted = new Date(submittedAt)
    const diffTime = submitted - due
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Late Submissions</h1>
        <p className="text-gray-600">Track and manage assignments submitted after the due date</p>
      </div>

      {/* Summary Card */}
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <div className="ml-4">
            <p className="text-2xl font-bold text-red-900">{lateSubmissions.length}</p>
            <p className="text-red-700">Total Late Submissions</p>
          </div>
        </div>
      </div>

      {lateSubmissions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {lateSubmissions.map((submission) => {
            const lateDays = calculateLateDays(submission.assignment.dueDate, submission.submittedAt)
            
            return (
              <div key={submission._id} className="card border-l-4 border-l-red-500 hover:shadow-md transition-shadow duration-200">
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
                    <span>Due: {new Date(submission.assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{submission.fileName}</span>
                  </div>
                </div>

                <div className="bg-red-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center text-red-800">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">
                      {lateDays} day{lateDays !== 1 ? 's' : ''} late
                    </span>
                  </div>
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

                <button
                  onClick={() => handleDownload(submission._id, submission.fileName)}
                  className="w-full flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Submission
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No late submissions</h3>
          <p className="text-gray-600">All students have submitted their assignments on time!</p>
        </div>
      )}
    </div>
  )
}

export default LateSubmissions