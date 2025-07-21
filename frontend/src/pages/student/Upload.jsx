import React, { useState, useEffect } from 'react'
import { Upload as UploadIcon, FileText, Calendar, Award, CheckCircle, AlertCircle } from 'lucide-react'
import { assignmentsAPI, submissionsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Upload = () => {
  const [assignments, setAssignments] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await assignmentsAPI.getStudentAssignments()
      // Filter assignments that haven't been submitted yet
      const unsubmittedAssignments = response.data.filter(assignment => !assignment.submission)
      setAssignments(unsubmittedAssignments)
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      
      // Check file type
      const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar']
      const fileExtension = file.name.split('.').pop().toLowerCase()
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Invalid file type. Only PDF, DOC, DOCX, TXT, ZIP, and RAR files are allowed.')
        return
      }
      
      setSelectedFile(file)
      toast.success('File selected successfully!')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      
      // Check file type
      const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar']
      const fileExtension = file.name.split('.').pop().toLowerCase()
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Invalid file type. Only PDF, DOC, DOCX, TXT, ZIP, and RAR files are allowed.')
        return
      }
      
      setSelectedFile(file)
      toast.success('File dropped successfully!')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }
    
    if (!selectedAssignment) {
      toast.error('Please select an assignment')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('assignmentId', selectedAssignment)
      formData.append('comments', comments)

      console.log('Submitting assignment:', {
        assignmentId: selectedAssignment,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        comments: comments
      })

      const response = await submissionsAPI.submit(formData)
      console.log('Submission response:', response.data)
      
      setSubmitted(true)
      toast.success('Assignment submitted successfully!')
      
      // Reset form after success
      setTimeout(() => {
        setSubmitted(false)
        setSelectedFile(null)
        setSelectedAssignment('')
        setComments('')
        fetchAssignments() // Refresh assignments list
      }, 3000)
      
    } catch (error) {
      console.error('Error submitting assignment:', error)
      const errorMessage = error.response?.data?.message || 'Failed to submit assignment'
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isOverdue = (dueDate) => {
    return new Date() > new Date(dueDate)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card bg-green-50 border-green-200 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">Assignment Submitted Successfully!</h2>
          <p className="text-green-700">Your assignment has been submitted and is now under review.</p>
          <div className="mt-4">
            <div className="animate-pulse text-green-600">Redirecting in 3 seconds...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Assignment</h1>
        <p className="text-gray-600">Submit your completed assignment for review</p>
      </div>

      {assignments.length === 0 ? (
        <div className="card text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments available</h3>
          <p className="text-gray-600">All assignments have been submitted or there are no active assignments.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Selection */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Assignment</h2>
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const overdue = isOverdue(assignment.dueDate)
                return (
                  <label
                    key={assignment._id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedAssignment === assignment._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${overdue ? 'border-l-4 border-l-red-500' : ''}`}
                  >
                    <input
                      type="radio"
                      name="assignment"
                      value={assignment._id}
                      checked={selectedAssignment === assignment._id}
                      onChange={(e) => setSelectedAssignment(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assignment.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-1" />
                            <span>{assignment.maxPoints} pts</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>{assignment.subject}</span>
                          </div>
                        </div>
                      </div>
                      {overdue && (
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Overdue
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* File Upload */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload File</h2>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-200"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">Drop your file here, or</p>
                  <label className="btn-primary cursor-pointer inline-flex items-center">
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Browse Files
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.zip,.rar,.txt"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: PDF, DOC, DOCX, ZIP, RAR, TXT (Max 10MB)
                </p>
              </div>

              {selectedFile && (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-8 w-8 text-primary-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      toast.success('File removed')
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Comments (Optional)</h2>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="input-field"
              placeholder="Add any notes or comments about your submission..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null)
                setSelectedAssignment('')
                setComments('')
                toast.success('Form cleared')
              }}
              className="btn-secondary"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={!selectedFile || !selectedAssignment || uploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2 inline" />
                  Submit Assignment
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Upload