import React, { useState, useEffect } from 'react'
import { Users, Clock, CheckCircle, Award, FileText, AlertCircle } from 'lucide-react'
import { submissionsAPI, gradesAPI, assignmentsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingReview: 0,
    graded: 0,
    lateSubmissions: 0
  })
  const [recentSubmissions, setRecentSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [submissionsRes, lateSubmissionsRes] = await Promise.all([
        submissionsAPI.getAll(),
        submissionsAPI.getLateSubmissions()
      ])

      const submissions = submissionsRes.data
      const lateSubmissions = lateSubmissionsRes.data

      // Calculate stats
      const totalSubmissions = submissions.length
      const pendingReview = submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length
      const graded = submissions.filter(s => s.status === 'graded').length
      const lateSubmissionsCount = lateSubmissions.length

      setStats({
        totalSubmissions,
        pendingReview,
        graded,
        lateSubmissions: lateSubmissionsCount
      })

      // Get recent submissions (last 5)
      const recentSubs = submissions
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5)

      setRecentSubmissions(recentSubs)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your teaching overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              <p className="text-gray-600">Total Submissions</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
              <p className="text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.graded}</p>
              <p className="text-gray-600">Graded</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.lateSubmissions}</p>
              <p className="text-gray-600">Late Submissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Submissions</h2>
        {recentSubmissions.length > 0 ? (
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <div key={submission._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-primary-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{submission.assignment.title}</h3>
                    <p className="text-sm text-gray-600">
                      by {submission.student.name} ({submission.student.studentId})
                    </p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {submission.isLate && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Late
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {submission.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent submissions</p>
        )}
      </div>
    </div>
  )
}

export default TeacherDashboard