import React, { useState, useEffect } from 'react'
import { Award, User, Calendar, FileText, Save } from 'lucide-react'
import { submissionsAPI, gradesAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const TeacherGrades = () => {
  const [submissions, setSubmissions] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [gradeForm, setGradeForm] = useState({ points: '', feedback: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [submissionsRes, gradesRes] = await Promise.all([
        submissionsAPI.getAll(),
        gradesAPI.getAll()
      ])
      
      setSubmissions(submissionsRes.data)
      setGrades(gradesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmit = async (e) => {
    e.preventDefault()
    if (!selectedSubmission || !gradeForm.points) return

    setSaving(true)
    try {
      const gradeData = {
        submissionId: selectedSubmission._id,
        points: parseInt(gradeForm.points),
        feedback: gradeForm.feedback
      }

      await gradesAPI.assign(gradeData)
      
      // Refresh data
      await fetchData()
      
      setSelectedSubmission(null)
      setGradeForm({ points: '', feedback: '' })
      toast.success('Grade assigned successfully!')
    } catch (error) {
      console.error('Error assigning grade:', error)
      toast.error(error.response?.data?.message || 'Failed to assign grade')
    } finally {
      setSaving(false)
    }
  }

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission)
    
    // Check if grade already exists
    const existingGrade = grades.find(g => g.submission === submission._id)
    if (existingGrade) {
      setGradeForm({
        points: existingGrade.points.toString(),
        feedback: existingGrade.feedback || ''
      })
    } else {
      setGradeForm({ points: '', feedback: '' })
    }
  }

  const getGradeForSubmission = (submissionId) => {
    return grades.find(grade => grade.submission === submissionId)
  }

  const calculatePercentage = (points, maxPoints) => {
    return Math.round((points / maxPoints) * 100)
  }

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return <LoadingSpinner />
  }

  // Filter submissions that are accepted or need grading
  const gradableSubmissions = submissions.filter(sub => 
    sub.status === 'accepted' || sub.status === 'submitted' || sub.status === 'graded'
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assign Grades</h1>
        <p className="text-gray-600">Grade student submissions and provide feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {gradableSubmissions.map((submission) => {
          const existingGrade = getGradeForSubmission(submission._id)
          const percentage = existingGrade 
            ? calculatePercentage(existingGrade.points, submission.assignment.maxPoints)
            : null

          return (
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
                {existingGrade && (
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getGradeColor(percentage)}`}>
                      {existingGrade.points}/{submission.assignment.maxPoints}
                    </div>
                    <div className="text-sm text-gray-500">{percentage}%</div>
                  </div>
                )}
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
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  <span>Max Points: {submission.assignment.maxPoints}</span>
                </div>
              </div>

              {existingGrade?.feedback && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-900 mb-1">Feedback:</h4>
                  <p className="text-gray-700 text-sm">{existingGrade.feedback}</p>
                </div>
              )}

              <button
                onClick={() => openGradeModal(submission)}
                className="w-full btn-primary"
              >
                {existingGrade ? 'Update Grade' : 'Assign Grade'}
              </button>
            </div>
          )
        })}
      </div>

      {gradableSubmissions.length === 0 && (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions to grade</h3>
          <p className="text-gray-600">All submissions have been graded or are not ready for grading.</p>
        </div>
      )}

      {/* Grade Assignment Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Assign Grade: {selectedSubmission.assignment.title}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <span className="font-medium text-gray-700">Student: </span>
                  <span>{selectedSubmission.student.name} ({selectedSubmission.student.studentId})</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Assignment: </span>
                  <span>{selectedSubmission.assignment.title}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Max Points: </span>
                  <span>{selectedSubmission.assignment.maxPoints}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Submitted: </span>
                  <span>{new Date(selectedSubmission.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div>
                  <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
                    Points (out of {selectedSubmission.assignment.maxPoints})
                  </label>
                  <input
                    type="number"
                    id="points"
                    min="0"
                    max={selectedSubmission.assignment.maxPoints}
                    value={gradeForm.points}
                    onChange={(e) => setGradeForm({ ...gradeForm, points: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    id="feedback"
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    rows={4}
                    className="input-field"
                    placeholder="Provide feedback for the student..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2 inline" />
                        Save Grade
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherGrades